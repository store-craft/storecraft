/**
 * @import {
 *  ApiQuery, Cursor, SortCursor, ExpandQuery, SortOrder, Tuple
 * } from './types.api.query.js';
 */
import { parse } from "../v-ql/index.js";
import { assert } from "./utils.func.js";


const SORT_BY = 'sortBy';
const ORDER = 'order';
const LIMIT = 'limit';
const LIMIT_TO_LAST = 'limitToLast';
const VQL = 'vql';
// const VQL_STRING = 'vqlString';
const START_AT = 'startAt';
const START_AFTER = 'startAfter';
const END_AT = 'endAt';
const END_BEFORE = 'endBefore';
const EXPAND = 'expand';

/**
 * @description Parse string tuples of the form (updated:2010-20-10,id:my-id) => [['updated', '2010-20-10'], ['id', 'my-id']]
 * @template {string} T
 * @param {string} str 
 * @returns {Tuple<T>[] | undefined}
 */
export const parse_tuples = (str="") => {
  if(!str) return undefined;

  const reg_prefix = /(^[^\w]+)/g;
  const reg_postfix = /([^\w]+$)/g;
  
  let a = str.match(reg_prefix);
  let b = str.match(reg_postfix);

  let sub = str.substring(a?.[0].length??0);
  sub = sub.substring(0, sub.length - (b?.[0].length??0));

  if(sub==='') return undefined;

  return sub.split(',')
            .map(
              s => {
                const parts = s.split(':');
                return [
                  parts[0].trim(),
                  parts.slice(1).join(':').trim()
                ]
              }
            );
}

/**
 * 
 * @param {URLSearchParams} s 
 * @param {ExpandQuery} [def=['*']] default value 
 * @return {ExpandQuery}
 */
export const parse_expand = (s, def = ['*']) => {
  return (
    s.get(EXPAND)?.replace(/[()]/g, '').split(',')?.map(
      s => s.trim()).filter(Boolean)
    ) ?? def;
}

/**
 * 
 * @param {string} s 
 * @returns {SortCursor}
 */
export const parse_sortby = (s) => {
  return (s ?? '(updated_at, id)').replace(/[()]/g, '').split(',').map(
    s => s.trim()).filter(Boolean);
}

/**
 * 
 * @param {string} s 
 * @returns {SortOrder}
 */
export const parse_sort_order = (s='desc') => {
  return (s==='asc') ? 'asc' : 'desc';
}

/**
 * @description Parse a queries such as:
 * 1. `vql="tag:a (tag:b)"&limit=10&startAt=(updated:2012,id:tomer)&order=asc`
 * 2. `startAt=(updated:2012,id:tomer)&sort=(updated:+, id:+)`
 * 
 * INTO a {`ParsedApiQuery`}
 * 
 * @param {URLSearchParams | string} s 
 * 
 * @returns {ApiQuery | undefined}
 */
export const parse_query = (s) => {
  s = s instanceof URLSearchParams ? s : new URLSearchParams(s)
  /** @type {ApiQuery} */
  const q = {};

  q.expand = parse_expand(s);
  q.limit = parseInt(s.get(LIMIT)) ? Math.abs(parseInt(s.get(LIMIT))) : undefined;
  q.limitToLast = parseInt(s.get(LIMIT_TO_LAST)) ? Math.abs(parseInt(s.get(LIMIT_TO_LAST))) : undefined;

  if(!q.limitToLast && !q.limit) {
    q.limit = 5;
  } 

  ////
  // VQL PARSING and VALIDATE
  ////
  try {
    const vql = s.get(VQL);

    if(vql) {
      q.vqlParsed = parse(vql);
    }
  } catch (e) {
    console.log(e);

    assert(false, 'VQL parsing failed', 401);
  }

  q.vql = s.get(VQL);

  ////
  // RANGE CURSORS PARSING and VALIDATE
  ////
  q.startAt = parse_tuples(s.get(START_AT));
  q.startAfter = parse_tuples(s.get(START_AFTER));
  assert(!(q.startAt && q.startAfter), 'Cannot set both startAt and startAfter', 401);

  q.endAt = parse_tuples(s.get(END_AT));
  q.endBefore = parse_tuples(s.get(END_BEFORE));
  assert(!(q.endAt && q.endBefore), 'Cannot set both endAt and endAfter', 401);

  // pick the chose representitives from range cursors
  const rep_start = q.startAt || q.startAfter;
  const rep_end = q.endAt || q.endBefore;
  const rep_shorter = (rep_start?.length ?? 0) < (rep_end?.length ?? 0) ? rep_start : rep_end;
  const rep_longer = rep_shorter===rep_start ? rep_end : rep_start;
  if(rep_start && rep_end) {
    // now let's assert matching keys up to the shortest one
    for(let ix=0; ix < rep_shorter.length; ix++) {
      const k1 = rep_shorter[ix][0];
      const k2 = rep_longer[ix][0];
      assert(k1===k2, `non matching keys \`${k1}\`!==\`${k2}\` in range cursors`, 401);
    }
  }

  ////
  // SORT CURSOR PARSING and VALIDATE
  ////

  // asc  [0, 1, 2, 3, 4, 5, ...]
  // desc [5, 4, 3, 2, 1, 0, ...]
  q.sortBy = parse_sortby(s.get(SORT_BY));
  q.order = parse_sort_order(s.get(ORDER));
  // if we have a range query, it dictates and overrides sort cursor
  if(rep_longer && rep_longer?.length) {
    q.sortBy = rep_longer.map(
      ([k, _], ix) => k
    );
  }

  // console.log(q)
  // console.log(JSON.stringify(q, null, 2))
  return q;
}

/////


/**
 * 
 * @param {string[]} array 
 */
const string_array_to_string = array => {
  const fill = array.join(',');
  return '(' + fill + ')';
}

/**
 * 
 * @param {Cursor} c 
 */
const cursor_to_string = c => {
  const string_array = c.map(
    tuple => `${tuple[0]}:${tuple[1]}`
  );
  return string_array_to_string(string_array);
}

/**
 * 
 * @param {ApiQuery} q 
 */
export const api_query_to_searchparams = q => {
  const sp = new URLSearchParams();

  // set some defaults
  q.order = q?.order ?? 'desc';
  q.sortBy = q?.sortBy ?? ['updated_at', 'id'];
  q.expand = q?.expand ?? ['*'];
  if(!q.limit && !q.limitToLast) {
    q.limit = 5;
  }
  // cursors
  // console.log(q);
  [
    { cursor: q.endAt, key: END_AT},
    { cursor: q.endBefore, key: END_BEFORE},
    { cursor: q.startAt, key: START_AT},
    { cursor: q.startAfter, key: START_AFTER},
  ]
  .filter(item => Boolean(item.cursor) && item.cursor?.length)
  .forEach(
    item => {
      sp.set(item.key, cursor_to_string(item.cursor));
    }
  );

  // sort
  sp.set(ORDER, q.order);
  sp.set(SORT_BY, string_array_to_string(q.sortBy));
  sp.set(EXPAND, string_array_to_string(q.expand));
  q.vql && sp.set(VQL, q.vql);
  // q.vqlString && sp.set(VQL, q.vqlString);
  q.limit && sp.set(LIMIT, q.limit.toString());
  q.limitToLast && sp.set(LIMIT_TO_LAST, q.limitToLast.toString());

  return sp;
}