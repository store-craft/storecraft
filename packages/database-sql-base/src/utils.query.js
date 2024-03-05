/**
 * @typedef {import("../index.js").Database} Database
 */

/**
 * Convert an API Query cursor into mongo dialect, also sanitize.
 * 
 * 1. (a1, a2) >  (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>b2)
 * 2. (a1, a2) >= (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>=b2)
 * 3. (a1, a2, a3) >  (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>b3)
 * 4. (a1, a2, a3) >= (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>=b3)
 * 
 * @param {import("kysely").ExpressionBuilder<Database>} eb 
 * @param {import("@storecraft/core").Cursor} c 
 * @param {'>' | '>=' | '<' | '<='} relation 
 * @param {(x: [k: string, v: any]) => [k: string, v: any]} transformer Your chance to change key and value
 */
export const query_cursor_to_eb = (eb, c, relation, transformer=(x)=>x) => {

  let rel_key_1; // relation in last conjunction term in [0, n-1] disjunctions
  let rel_key_2; // relation in last conjunction term in last disjunction

  if (relation==='>' || relation==='>=') {
    rel_key_1 = rel_key_2 = '>';
    if(relation==='>=')
      rel_key_2='>=';
  }
  else if (relation==='<' || relation==='<=') {
    rel_key_1 = rel_key_2 = '<';
    if(relation==='<=')
      rel_key_2='<=';
  } else return undefined;

  
  const disjunctions = [];
  // each disjunction clause
  for (let ix = 0; ix < c.length; ix++) {
    const is_last_disjunction = ix==c.length-1;
    const conjunctions = [];
    // each conjunction clause up until the last term (not inclusive)
    for (let jx = 0; jx < ix; jx++) {
      // the a_n=b_n
      const r = transformer(c[jx]);
      
      // conjunctions.push({ [r[0]] : r[1] });
      conjunctions.push(eb(r[0], '=', r[1]));
    }

    // Last conjunction term
    const relation_key = is_last_disjunction ? rel_key_2 : rel_key_1;
    const r = transformer(c[ix]);
    // conjunctions.push({ [r[0]] : { [relation_key]: r[1] } });
    conjunctions.push(eb(r[0], relation_key, r[1]));
    // Add to disjunctions list
    // disjunctions.push({ $and: conjunctions });
    disjunctions.push(eb.and(conjunctions));
  }

  if(disjunctions.length==0)
    return undefined;

  // const result = {
  //   $or: disjunctions
  // };

  return eb.or(disjunctions);

  // return result;
}

// eb.exists(
//   eb => eb
//     .selectFrom(table)
//     .select('id')
//     .where(
//       eb => eb.and([
//         eb.or([
//           eb(`${table}.entity_id`, '=', eb.ref('products.id')),
//           eb(`${table}.entity_handle`, '=', eb.ref('products.handle')),
//         ]),
//         eb(`${table}.value`, op, value)
//       ])
//     )
// )

/**
 * @param {import("kysely").ExpressionBuilder<Database>} eb 
 * @param {import("@storecraft/core/v-ql").VQL.Node} node 
 * @param {keyof Database} table_name 
 */
export const query_vql_node_to_eb = (eb, node, table_name) => {
  if(node.op==='LEAF') {
    return eb
      .exists(
        eb => eb
          .selectFrom('entity_to_search_terms')
          .select('id')
          .where(
            eb => eb.and([
              eb.or([
                eb(`entity_to_search_terms.entity_id`, '=', eb.ref(`${table_name}.id`)),
                eb(`entity_to_search_terms.entity_handle`, '=', eb.ref(`${table_name}.handle`)),
              ]),
              eb(`entity_to_search_terms.value`, 'ilike', node.value)
            ])
          )
      )

    // return {
    //   search: { $regex: `^${node.value}$` }
    // }
  }

  let conjunctions = [];
  for(let arg of node?.args) {
    conjunctions.push(query_vql_node_to_eb(eb, arg, table_name));
  }

  switch (node.op) {
    case '&':
      return eb.and(conjunctions)
    case '|':
      return eb.or(conjunctions)
    case '!':
      return eb.not(conjunctions[0])
    default:
      throw new Error('VQL-to-mongo-failed')
  }

}

/**
 * @param {import("kysely").ExpressionBuilder<Database>} eb 
 * @param {import("@storecraft/core/v-ql").VQL.Node} root 
 * @param {keyof Database} table_name 
 */
export const query_vql_to_eb = (eb, root, table_name) => {
  return root ? query_vql_node_to_eb(eb, root, table_name) : undefined;
}


/**
 * Convert an API Query into mongo dialect, also sanitize.
 * @param {import("kysely").ExpressionBuilder<Database>} eb 
 * @param {import("@storecraft/core").ApiQuery} q 
 * @param {keyof Database} table_name 
 */
export const query_to_eb = (eb, q, table_name) => {
  if(!q) return undefined;
  const filter = {};
  const clauses = [];
  const sort_sign = q.order === 'asc' ? 1 : -1;
  const asc = sort_sign==1;

  // compute index clauses
  if(q.startAt) {
    clauses.push(query_cursor_to_eb(eb, q.startAt, asc ? '>=' : '<='));
  } else if(q.startAfter) {
    clauses.push(query_cursor_to_eb(eb, q.startAfter, asc ? '>' : '<'));
  }

  if(q.endAt) {
    clauses.push(query_cursor_to_eb(eb, q.endAt, asc ? '<=' : '>='));
  } else if(q.endBefore) {
    clauses.push(query_cursor_to_eb(eb, q.endBefore, asc ? '<' : '>'));
  }

  // compute VQL clauses 
  const vql_clause = query_vql_to_eb(eb, q.vql, table_name)
  vql_clause && clauses.push(vql_clause);

  // compute sort fields and order
  // const sort = (q.sortBy ?? []).reduce((p, c) => (p[c==='id' ? '_id' : c]=sort_sign) && p , {});

  if(clauses?.length) {
    // filter['$and'] = clauses;
    filter.eb = eb.and(clauses);
  }

  return filter;
}

/**
 * Convert an API Query into mongo dialect, also sanitize.
 * @template D
 * @param {import("@storecraft/core").ApiQuery} q 
 */
export const query_to_sort = (q={}) => {
  const sort_sign = q.order === 'asc' ? 'asc' : 'desc';

  // compute sort fields and order
  const sort = (q.sortBy ?? []).map(
    s => `${s} ${sort_sign}`
  )
  
  return sort;
}
