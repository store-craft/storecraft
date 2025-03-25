/**
 * @import { ApiQuery, Cursor } from '@storecraft/core/api'
 * @import { VQL } from '@storecraft/core/vql'
 * @import { Database } from '../types.sql.tables.js'
 * @import { ExpressionBuilder } from 'kysely'
 */

import { parse } from "@storecraft/core/vql";

/**
 * Convert an API Query cursor into mongo dialect, also sanitize.
 * 
 * 1. (a1, a2) >  (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>b2)
 * 2. (a1, a2) >= (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>=b2)
 * 3. (a1, a2, a3) >  (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>b3)
 * 4. (a1, a2, a3) >= (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>=b3)
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {Cursor} c 
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


/**
 * @template {keyof Database} T
 * @param {ExpressionBuilder<Database>} eb 
 * @param {VQL.Node} node 
 * @param {T} table_name 
 */
export const query_vql_node_to_eb = (eb, node, table_name) => {
  if(node.op==='LEAF') {
    // console.log('value', node.value)
    return eb
    .exists(
      eb => eb
      .selectFrom('entity_to_search_terms')
      .select('id')
      .where(
        eb => eb.and(
          [
            eb.or(
              [
                eb(`entity_to_search_terms.entity_id`, '=', eb.ref(`${table_name}.id`)),
                eb(`entity_to_search_terms.entity_handle`, '=', eb.ref(`${table_name}.handle`)),
              ]
            ),
            eb(`entity_to_search_terms.value`, 'like', node.value.toLowerCase())
          ]
        )
      )
    )
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
      throw new Error('VQL-failed')
  }

}

/**
 * @param {ExpressionBuilder<Database>} eb 
 * @param {VQL.Node} root 
 * @param {keyof Database} table_name 
 */
export const query_vql_to_eb = (eb, root, table_name) => {
  return root ? query_vql_node_to_eb(eb, root, table_name) : undefined;
}


/**
 * 
 * @param {[k: string, v: any]} kv 
 * @param {keyof Database} table_name 
 * @returns {[k: string, v: any]}  
 */
const transform_boolean_to_0_or_1 = (kv, table_name) => {

  // console.log('transform_boolean_to_0_or_1', kv)
  kv = [
    table_name ? `${table_name}.${kv[0]}` : kv[0],
    typeof kv[1] === 'boolean' ? (kv[1] ? 1 : 0) : kv[1]
  ];

  return kv;
}

/**
 * Convert an API Query into dialect, also sanitize.
 * 
 * @template {any} [T=any]
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {ApiQuery<T>} q 
 * @param {keyof Database} table_name 
 * 
 */
export const query_to_eb = (eb, q={}, table_name) => {
  const clauses = [];

  const sort_sign = q.order === 'asc' ? 1 : -1;
  const asc = sort_sign==1;
  const transformer = (x) => transform_boolean_to_0_or_1(x, table_name);

  // compute index clauses
  if(q.startAt) {
    clauses.push(query_cursor_to_eb(eb, q.startAt, asc ? '>=' : '<=', transformer));
  } else if(q.startAfter) {
    clauses.push(query_cursor_to_eb(eb, q.startAfter, asc ? '>' : '<', transformer));
  }

  if(q.endAt) {
    clauses.push(query_cursor_to_eb(eb, q.endAt, asc ? '<=' : '>=', transformer));
  } else if(q.endBefore) {
    clauses.push(query_cursor_to_eb(eb, q.endBefore, asc ? '<' : '>', transformer));
  }

  // compute VQL clauses 
  try {
    if(q.vql && !q.vqlParsed) {
      q.vqlParsed = parse(q.vql)
    }
  } catch(e) {}

  const vql_clause = query_vql_to_eb(eb, q.vqlParsed, table_name)
  vql_clause && clauses.push(vql_clause);

  return eb.and(clauses);
}

const SIGN = {
  '1': 'asc',
  '-1': 'desc'
}

// export type DirectedOrderByStringReference<DB, TB extends keyof DB, O> = `${StringReference<DB, TB> | (keyof O & string)} ${OrderByDirection}`;

/**
 * @import {DirectedOrderByStringReference} from './utils.types.js'
 */
// OE extends OrderByExpression<DB, TB, O>
/**
 * Convert an API Query into mongo dialect, also sanitize.
 * @template {Record<string, any>} [Type=Record<string, any>]
 * @template {keyof Database} [Table=keyof Database]
 * 
 * @param {ApiQuery<Type>} q 
 * @param {Table} table 
 * @returns {DirectedOrderByStringReference<Database, Table, Database[Table]>[]}
 */
export const query_to_sort = (q={}, table) => {
  // const sort_sign = q.order === 'asc' ? 'asc' : 'desc';
  // `reverse_sign=-1` means we need to reverse because of `limitToLast`
  const reverse_sign = (q.limitToLast && !q.limit) ? -1 : 1;
  const asc = q.order === 'asc';
  const sort_sign = (asc ? 1 : -1) * reverse_sign;

  // compute sort fields and order
  const keys = q.sortBy?.length ? q.sortBy :  ['updated_at', 'id'];
  const sort = keys.map(
    s => table ? `${table}.${s} ${SIGN[sort_sign]}` : `${s} ${SIGN[sort_sign]}`
  )
  // it's too complicated to map each ket to table column.
  // kysely was designed to do this in place
  return sort;
}
