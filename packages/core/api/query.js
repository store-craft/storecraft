/**
 * @import {
 *  ApiQuery, SortCursor, 
 *  ExpandQuery, SortOrder,
 * } from './types.api.query.js';
 */
import { compile, parse } from "../vql/index.js";
import { assert } from "./utils.func.js";
import { 
  cursor_to_string,
  parse_list_from_string, 
  string_array_to_string 
} from "./query.utils.js";
import { 
  END_AT,
  END_BEFORE,
  EQUALS,
  legacy_query_to_vql_string,
  parse_legacy_query_cursor, 
  START_AFTER, 
  START_AT
} from "./query.legacy.js";
import { combine_vql_strings } from "../vql/utils.js";

export const SORT_BY = 'sortBy';
export const ORDER = 'order';
export const LIMIT = 'limit';
export const LIMIT_TO_LAST = 'limitToLast';
export const VQL = 'vql';
export const EXPAND = 'expand';
export const REGEX_ALLOWED_CHARS = /[a-zA-Z0-9\_\:\-\+\*\s\'\"\.]+/g

/**
 * @description Parse a string query parameter into 
 * a list of fields to expand
 * @param {URLSearchParams} s 
 * @param {ExpandQuery} [def=['*']] default value 
 * @return {ExpandQuery}
 */
export const parse_expand = (s, def = ['*']) => {
  return parse_list_from_string(s.get(EXPAND), def);
}

/**
 * @description Parse a string query parameter into a 
 * list of fields to sort by
 * @param {URLSearchParams} [s] 
 * @returns {SortCursor}
 */
export const parse_sortby = (s) => {
  return parse_list_from_string(
    s?.get(SORT_BY) ?? '(updated_at, id)'
  );
}

/**
 * @description Parse a string query parameter into a SortOrder
 * @param {URLSearchParams} [s] 
 * @returns {SortOrder}
 */
export const parse_sort_order = (s) => {
  return (s?.get(ORDER)==='asc') ? 'asc' : 'desc';
}

/**
 * @description Parse a queries such as:
 * 1. `vql="tag:a (tag:b)"&limit=10&startAt=(updated:2012,id:tomer)&order=asc`
 * 2. `startAt=(updated:2012,id:tomer)&sort=(updated:+, id:+)`
 * 
 * INTO a {@link ApiQuery}
 * 
 * @param {URLSearchParams | string} s 
 * @returns {ApiQuery | undefined}
 */
export const parse_query = (s) => {
  s = new URLSearchParams(s);

  const q = /** @type {ApiQuery} */ ({});

  // console.log(s.toString())

  q.expand = parse_expand(s);
  // asc  [0, 1, 2, 3, 4, 5, ...]
  // desc [5, 4, 3, 2, 1, 0, ...]
  q.sortBy = parse_sortby(s);
  q.order = parse_sort_order(s);

  q.limit = parseInt(s.get(LIMIT)) ? 
    Math.abs(parseInt(s.get(LIMIT))) : 
    undefined;

  q.limitToLast = parseInt(s.get(LIMIT_TO_LAST)) ? 
    Math.abs(parseInt(s.get(LIMIT_TO_LAST))) : 
    undefined;

  if(!q.limitToLast && !q.limit) {
    q.limit = 5;
  } 

  { // LEGACY query cursor, will be deprecated
    let {
      legacy_q,
      vql_string
    } = parse_legacy_query_cursor(s);

    // console.log({vql_string});

    const combined = combine_vql_strings(
      s.get(VQL),
      vql_string
    );

    // set it so it will be parsed later.
    s.set(VQL, combined);

    // align sort cursor to query range cursors.
    if(legacy_q?.sortBy)
      q.sortBy = legacy_q.sortBy;
  }

  // `vql` parsing
  try {
    const vql = s.get(VQL);
    
    // console.log({vql})

    q.vql_as_string = vql;

    if(vql) {
      q.vql = parse(vql);
    }
  } catch (e) {
    console.error('VQL parsing failed ', e);
    assert(
      false, 'VQL parsing failed', 401
    );
  }
  
  return q;
}

/**
 * @description Convert an `ApiQuery` into a `URLSearchParams`
 * @param {ApiQuery<any>} q 
 */
export const api_query_to_searchparams = (q) => {
  const sp = new URLSearchParams();

  // set some defaults
  q.order = q?.order ?? 'desc';
  q.sortBy = q?.sortBy ?? ['updated_at', 'id'];
  q.expand = q?.expand ?? ['*'];
  // at least one of them limits
  if(!q.limit && !q.limitToLast) {
    q.limit = 5;
  }

  // set
  sp.set(ORDER, q.order);
  sp.set(SORT_BY, string_array_to_string(q.sortBy));
  sp.set(EXPAND, string_array_to_string(q.expand));
  sp.set(VQL, q.vql_as_string ?? compile(q.vql));
  q.limit && sp.set(LIMIT, q.limit.toString());
  q.limitToLast && sp.set(LIMIT_TO_LAST, q.limitToLast.toString());

  { // LEGACY query cursor, will be deprecated

    [
      { cursor: q.equals, key: EQUALS},
      { cursor: q.endAt, key: END_AT},
      { cursor: q.endBefore, key: END_BEFORE},
      { cursor: q.startAt, key: START_AT},
      { cursor: q.startAfter, key: START_AFTER},
    ]
    .filter(item => Boolean(item.cursor) && item.cursor?.length)
    .forEach(
      item => {
        console.warn(
          'Legacy query cursors `equals` / `endAt` / `endBefore` ' +
          '/ `startAt` / `startAfter`' +
          'will be deprecated, use `vql` instead',
        );
        sp.set(item.key, cursor_to_string(item.cursor));
      }
    );

    // const legacy_to_vql_string = legacy_query_to_vql_string(q);
    // if(legacy_to_vql_string) {
    //   const current_vql_string = sp.get(VQL);
    //   console.log({current_vql_string, legacy_to_vql_string})
    //   const parts = [];

    //   if(current_vql_string) {
    //     parts.push(
    //       parenthesise_vql_string(current_vql_string)
    //     );
    //   }

    //   if(legacy_to_vql_string) {
    //     parts.push(legacy_to_vql_string);
    //   }

    //   if(parts.length) {
    //     sp.set(VQL, parts.join(' & '));
    //   }
    // }
  }

  // console.log({q, sp: sp.toString()});

  return sp;
}


/**
 * @description Convert an object into a `URLSearchParams`
 * @param {Record<string, string | number | boolean>} o 
 */
export const object_to_search_params = o => {
  // @ts-ignore
  return new URLSearchParams(o);
}