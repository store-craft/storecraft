import { to_objid } from "./utils.funcs.js";

let a = { 
  $or: [
    { updated_at: { $gt: '2024-01-24T20:28:24.126Z'} },
    { $and : [ { updated_at: '2024-01-24T20:28:24.126Z' }, { id: { $gte : 'tag_65b172ebc4c9552fd46c1027'}}]}
  ], 
}

/**
 * Convert an API Query cursor into mongo dialect, also sanitize.
 * 
 * 1. (a1, a2) >  (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>b2)
 * 2. (a1, a2) >= (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>=b2)
 * 3. (a1, a2, a3) >  (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>b3)
 * 4. (a1, a2, a3) >= (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>=b3)
 * 
 * @param {import("@storecraft/core/v-api").Cursor} c 
 * @param {'>' | '>=' | '<' | '<='} relation 
 * @param {(x: [k: string, v: any]) => [k: string, v: any]} transformer Your chance to change key and value
 */
export const query_cursor_to_mongo = (c, relation, transformer=(x)=>x) => {

  let rel_key_1; // relation in last conjunction term in [0, n-1] disjunctions
  let rel_key_2; // relation in last conjunction term in last disjunction

  if (relation==='>' || relation==='>=') {
    rel_key_1 = rel_key_2 = '$gt';
    if(relation==='>=')
      rel_key_2='$gte';
  }
  else if (relation==='<' || relation==='<=') {
    rel_key_1 = rel_key_2 = '$lt';
    if(relation==='<=')
      rel_key_2='$lte';
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
      conjunctions.push({ [r[0]] : r[1] });
    }

    // Last conjunction term
    const relation_key = is_last_disjunction ? rel_key_2 : rel_key_1;
    const r = transformer(c[ix]);
    conjunctions.push({ [r[0]] : { [relation_key]: r[1] } });
    // Add to disjunctions list
    disjunctions.push({ $and: conjunctions });
  }

  if(disjunctions.length==0)
    return undefined;

  const result = {
    $or: disjunctions
  };

  return result;
}

/**
 * @param {import("@storecraft/core/v-ql").VQL.Node} node 
 */
export const query_vql_node_to_mongo = node => {
  if(node.op==='LEAF') {
    return {
      '_relations.search': { $regex: `^${node.value}$` }
    }
  }

  let conjunctions = [];
  for(let arg of node?.args) {
    conjunctions.push(query_vql_node_to_mongo(arg));
  }

  switch (node.op) {
    case '&':
      return {
        $and: conjunctions
      }
    case '|':
      return {
        $or: conjunctions
      }
    case '!':
      return {
        $nor: [ conjunctions[0] ]
      }
  
    default:
      throw new Error('VQL-to-mongo-failed')
  }

}

/**
 * 
 * @param {import("@storecraft/core/v-ql").VQL.Node} root 
 */
export const query_vql_to_mongo = root => {
  return root ? query_vql_node_to_mongo(root) : undefined;
}

/**
 * Let's transform ids into mongo ids
 * @param {import("@storecraft/core/v-api").Tuple<string>} c a cursor record
 * @returns {[k: string, v: any]}
 */
const transform = c => {
  if(c[0]!=='id') 
    return c;
  return [ '_id', to_objid(c[1]) ];
}

/**
 * Convert an API Query into mongo dialect, also sanitize.
 * @param {import("@storecraft/core/v-api").ApiQuery} q 
 */
export const query_to_mongo = (q) => {
  const filter = {};
  const clauses = [];
  const reverse_sign = q.limitToLast && !q.limit ? -1 : 1;
  const asc = q.order === 'asc';
  const sort_sign = (asc ? 1 : -1) * reverse_sign;

  // compute index clauses
  if(q.startAt) {
    clauses.push(query_cursor_to_mongo(q.startAt, asc ? '>=' : '<=', transform));
  } else if(q.startAfter) {
    clauses.push(query_cursor_to_mongo(q.startAfter, asc ? '>' : '<', transform));
  }

  if(q.endAt) {
    clauses.push(query_cursor_to_mongo(q.endAt, asc ? '<=' : '>=', transform));
  } else if(q.endBefore) {
    clauses.push(query_cursor_to_mongo(q.endBefore, asc ? '<' : '>', transform));
  }

  // compute VQL clauses 
  const vql_clause = query_vql_to_mongo(q.vql)
  vql_clause && clauses.push(vql_clause);

  // compute sort fields and order
  const sort = (q.sortBy ?? []).reduce((p, c) => (p[c==='id' ? '_id' : c]=sort_sign) && p , {});

  if(clauses?.length) {
    filter['$and'] = clauses;
  }

  return {
    filter,
    sort,
    reverse_sign
  }

}
