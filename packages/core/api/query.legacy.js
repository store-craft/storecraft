/**
 * @import {
 *  ApiQuery, Cursor
 * } from './types.api.query.js';
 * @import { VQL_STRING_OPS } from '../vql/types.js';
 */
import { parenthesise_vql_string as parenthesise_vql_string, parse_tuples } from "./query.utils.js";
import { assert } from "./utils.func.js";

/** @deprecated Use `vql` instead */
export const EQUALS = 'equals';
/** @deprecated Use `vql` instead */
export const START_AT = 'startAt';
/** @deprecated Use `vql` instead */
export const START_AFTER = 'startAfter';
/** @deprecated Use `vql` instead */
export const END_AT = 'endAt';
/** @deprecated Use `vql` instead */
export const END_BEFORE = 'endBefore';

/**
 * @description support legacy query cursor to vql string.
 * 
 * This will convert sane length tuples and a relation (``>`, `>=`, `<`, `<=`)
 * into a VQL string compatible cursor used for paginating large data
 * sets efficiently.
 * 
 * 1. (a1, a2) >  (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>b2)
 * 2. (a1, a2) >= (b1, b2) ==> (a1 > b1) || (a1=b1 & a2>=b2)
 * 3. (a1, a2, a3) >  (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>b3)
 * 4. (a1, a2, a3) >= (b1, b2, b3) ==> (a1 > b1) || (a1=b1 & a2>b2) || (a1=b1 & a2=b2 & a3>=b3)
 * 
 * @param {Cursor} c 
 * @param {'>' | '>=' | '<' | '<='} relation 
 * Your chance to change key and value
 */
export const binary_tuple_compare_into_vql_string_cursor = (
  c, relation,
) => {

  /** @type {VQL_STRING_OPS} */
  let rel_key_1; // relation in last conjunction term in [0, n-1] disjunctions
  /** @type {VQL_STRING_OPS} */
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
      const r = c[jx];
      conjunctions.push(r[0] + '=' + r[1]);
    }

    // Last conjunction term
    const relation_key = is_last_disjunction ? 
      rel_key_2 : 
      rel_key_1;

    const r = c[ix];

    conjunctions.push(r[0] + relation_key + r[1]);
    disjunctions.push(
      '(' + conjunctions.join(' & ') + ')'
    );
  }

  if(disjunctions.length==0)
    return undefined;

  return '(' + disjunctions.join(' | ') + ')';
}


/**
 * @description support legacy query cursor to vql string.
 * This means that if `startAt` / `endAt` / `startAfter` / 
 * `endBefore` is set, it will be converted to a VQL string.
 * This is used to support legacy queries.
 * @param {ApiQuery} q 
 * @returns {string | undefined} `undefined` or a VQL string
 * with padded parentheses `()`
 */
export const legacy_query_to_vql_string = (q={}) => {
  const asc = q.order === 'asc';
  const parts = [];

  if(q.startAt) {
    console.warn('Query `startAt` is deprecated, use `vql` instead');
    parts.push(
      binary_tuple_compare_into_vql_string_cursor(
        q.startAt, asc ? '>=' : '<='
      )
    );
  } else if(q.startAfter) {
    console.warn('Query `startAfter` is deprecated, use `vql` instead');
    parts.push(
      binary_tuple_compare_into_vql_string_cursor(
        q.startAfter, asc ? '>' : '<'
      )
    );
  }

  if(q.endAt) {
    console.warn('Query `endAt` is deprecated, use `vql` instead');
    parts.push(
      binary_tuple_compare_into_vql_string_cursor(
        q.endAt, asc ? '<=' : '>='
      )
    );
  } else if(q.endBefore) {
    console.warn('Query `endBefore` is deprecated, use `vql` instead');
    parts.push(
      binary_tuple_compare_into_vql_string_cursor(
        q.endBefore, asc ? '<' : '>'
      )
    );
  }

  if(parts.length==0)
    return undefined;

  return parenthesise_vql_string(
    parts
    .filter(Boolean)
    .join(' & ')
  );
}


/**
 * @description support legacy query cursor.
 * @param {URLSearchParams} s url search params
 */
export const parse_legacy_query_cursor = (s) => {

  // create a temporary query object
  const q = /** @type {ApiQuery} */({});

  if(s.get(EQUALS)) {
    // let's map it
    s.set(START_AT, s.get(EQUALS));
    s.set(END_AT, s.get(EQUALS));
  }

  ////
  // RANGE CURSORS PARSING and VALIDATE
  ////
  q.startAt = parse_tuples(s.get(START_AT));
  q.startAfter = parse_tuples(s.get(START_AFTER));
  assert(
    !(q.startAt && q.startAfter), 
    'Cannot set both startAt and startAfter', 401
  );

  q.endAt = parse_tuples(s.get(END_AT));
  q.endBefore = parse_tuples(s.get(END_BEFORE));
  assert(
    !(q.endAt && q.endBefore), 
    'Cannot set both endAt and endAfter', 401
  );

  // pick the chose representitives from range cursors
  const rep_start = q.startAt || q.startAfter;
  const rep_end = q.endAt || q.endBefore;

  const rep_shorter = (
    (rep_start?.length ?? 0) < (rep_end?.length ?? 0)
  ) ? rep_start : rep_end;

  const rep_longer = rep_shorter===rep_start ? 
    rep_end : rep_start;
    
  // now let's assert matching keys up to the shortest one
  if(rep_start && rep_end) {
    for(let ix=0; ix < rep_shorter.length; ix++) {
      const k1 = rep_shorter[ix][0];
      const k2 = rep_longer[ix][0];

      assert(
        k1===k2, 
        `non matching keys \`${k1}\`!==\`${k2}\` in range cursors`, 401
      );
    }
  }

  // if we have a range query, it dictates and overrides sort cursor
  if(rep_longer && rep_longer?.length) {
    q.sortBy = rep_longer.map(
      ([k, _], ix) => k
    );
  }

  const vql_string = legacy_query_to_vql_string(q);

  return {
    legacy_q: q, 
    vql_string,
  }
}