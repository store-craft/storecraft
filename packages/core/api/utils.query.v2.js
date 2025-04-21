/**
 * @import {
 *  ApiQuery, Cursor, SortCursor, ExpandQuery, SortOrder, Tuple
 * } from './types.api.query.js';
 */
import { parse } from "../vql/index.js";
import { assert } from "./utils.func.js";


const SORT_BY = 'sortBy';
const ORDER = 'order';
const LIMIT = 'limit';
const LIMIT_TO_LAST = 'limitToLast';
const VQL = 'vql';
// const VQL_STRING = 'vqlString';
const EQUALS = 'equals';
const START_AT = 'startAt';
const START_AFTER = 'startAfter';
const END_AT = 'endAt';
const END_BEFORE = 'endBefore';
export const EXPAND = 'expand';
export const REGEX_ALLOWED_CHARS = /[a-zA-Z0-9\_\:\-\+\*\s\'\"\.]+/g

export function is_string_a_number(str='') {
  if (typeof str != "string") return false // we only process strings!
  // could also coerce to string: str = ""+str
  // @ts-ignore
  return !isNaN(str) && !isNaN(parseFloat(str))
}

/**
 * @description Parse a value part of a tuple, where the value
 * part may be:
 * 1. direct-string: 'string1' | "string2"
 * 2. boolean: true | false
 * 3. number: 50, 10.32 ...
 * 4. indirect-string: if does not start+end with commas '..', "..", we cast it as string
 * @param {string} part 
 */
export const parse_value_part = (part='') => {
  // first test if direct-string
  if(
    (part.startsWith("'") && part.endsWith("'")) ||
    (part.startsWith('"') && part.endsWith('"'))
  ) {
    return part.slice(1, -1)
  }

  if(is_string_a_number(part))
    return parseFloat(part);

  if(part==='true') {
    return true;
  }

  if(part==='false') {
    return false;
  }

  // else return as indirect string
  return part;
}


/**
 * @description Parse string tuples of the form 
 * - (updated:2010-20-10,id:my-id) => [['updated', '2010-20-10'], ['id', 'my-id']]
 * - updated:2010-20-10 ,  id:my-id => [['updated', '2010-20-10'], ['id', 'my-id']]
 * @param {string} str 
 * @returns {Tuple[]}
 */
export const parse_tuples_old = (str="") => {
  if(!str) return undefined;
  // q.match(/[a-zA-Z0-9_:-]+/g)
  const reg_prefix = /(^[^\w]+)/g;
  const reg_postfix = /([^\w\"\']+$)/g;
  
  let a = str.match(reg_prefix);
  let b = str.match(reg_postfix);

  let sub = str.substring(a?.[0].length??0);
  sub = sub.substring(0, sub.length - (b?.[0].length??0));

  if(sub==='') return undefined;

  return sub
    .split(',')
    .map(
      s => {
        const parts = s.split(':');
        const key = parts[0].trim();
        // value can be: 'string', 43.434, true, false
        const value_part = parts.slice(1).join(':').trim();
        const value = parse_value_part(value_part);
        return [
          key,
          value
        ]
      }
    );
}

/**
 * @description Parse string tuples of the form 
 * - (updated:2010-20-10,id:my-id) => [['updated', '2010-20-10'], ['id', 'my-id']]
 * - updated:2010-20-10 ,  id:my-id => [['updated', '2010-20-10'], ['id', 'my-id']]
 * - updated:2010-20-10|id:my-id => [['updated', '2010-20-10'], ['id', 'my-id']]
 * @param {string} str 
 * @returns {Tuple<string>[]}
 */
export const parse_tuples = (str="") => {
  if(!str) return undefined;
  // ['k1:v1', 'k2:v2']
  const kv_parts = str.match(REGEX_ALLOWED_CHARS)

  return kv_parts.map(
    (part) => {
      const parts = part.split(':');
      const key = parts[0].trim();
      // value can be: 'string', 43.434, true, false
      const value_part = parts.slice(1).join(':').trim();
      const value = parse_value_part(value_part);
      return [
        key,
        value
      ]
    }
  );
}

/**
 * @description Parse a string query parameter into a list of fields to expand
 * @param {URLSearchParams} s 
 * @param {ExpandQuery} [def=['*']] default value 
 * @return {ExpandQuery}
 */
export const parse_expand = (s, def = ['*']) => {
  return parse_list_from_string(s.get(EXPAND), def);
}

/**
 * @description Parse a string query parameter into a list of fields to sort by
 * @param {string} [s] 
 * @returns {SortCursor}
 */
export const parse_sortby = (s) => {
  return parse_list_from_string(
    s ?? '(updated_at, id)'
  );
}

/**
 * @description Parse a string query parameter into a SortOrder
 * @param {string} [s] 
 * @returns {SortOrder}
 */
export const parse_sort_order = (s='desc') => {
  return (s==='asc') ? 'asc' : 'desc';
}

/**
 * @description Given a string query, that represents a Delmiter NOT from `[a-zA-Z0-9_:-]`, 
 * then parse it into list.
 * 
 * Examples:
 * 1. '(a, b, c)' => ['a', 'b', 'c']
 * 2. 'a | b | c' => ['a', 'b', 'c']
 * 2. 'k1:v1 | k2:v2' => ['k1:v1', 'k2:v2']
 * 
 * @param {string} q
 * @param {string[]} [defaultList=[]]
 * @returns {string[]}
 */
export const parse_list_from_string = (q='', defaultList=[]) => {
  const list = q?.match(REGEX_ALLOWED_CHARS).map(p => p.trim())?.filter(Boolean) ?? defaultList;
  return list;
}

/**
 * 
 * @param {string} q 
 * @param {number} [defaultValue=Number.NaN] 
 * @returns {number | undefined}
 */
export const parse_number_from_string = (q, defaultValue=Number.NaN) => {
  if(is_string_a_number(q))
    return parseFloat(q);
  return defaultValue;
}

/**
 * @description Parse a queries such as:
 * 1. `vql="tag:a (tag:b)"&limit=10&startAt=(updated:2012,id:tomer)&order=asc`
 * 2. `startAt=(updated:2012,id:tomer)&sort=(updated:+, id:+)`
 * 
 * INTO a {`ParsedApiQuery`}
 * @param {URLSearchParams | string} s 
 * @returns {ApiQuery | undefined}
 */
export const parse_query = (s) => {
  s = s instanceof URLSearchParams ? s : new URLSearchParams(s)
  /** @type {ApiQuery} */
  const q = {};

  // console.log(s.toString())

  q.expand = parse_expand(s);
  q.limit = parseInt(s.get(LIMIT)) ? 
        Math.abs(parseInt(s.get(LIMIT))) : undefined;
  q.limitToLast = parseInt(s.get(LIMIT_TO_LAST)) ? 
        Math.abs(parseInt(s.get(LIMIT_TO_LAST))) : undefined;

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
  const rep_shorter = (rep_start?.length ?? 0) < (rep_end?.length ?? 0) ? rep_start : rep_end;
  const rep_longer = rep_shorter===rep_start ? rep_end : rep_start;
  if(rep_start && rep_end) {
    // now let's assert matching keys up to the shortest one
    for(let ix=0; ix < rep_shorter.length; ix++) {
      const k1 = rep_shorter[ix][0];
      const k2 = rep_longer[ix][0];
      assert(
        k1===k2, 
        `non matching keys \`${k1}\`!==\`${k2}\` in range cursors`, 401
      );
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
 * @description Convert a string array into a string
 * @param {string[]} array 
 * @param {string} [defaultValue] 
 */
export const string_array_to_string = (array, defaultValue) => {
  if(!(Array.isArray(array)))
    return defaultValue;
  
  const fill = array.join(',');
  return '(' + fill + ')';
}

/**
 * @description Convert a cursor into a string
 * @param {Cursor} c 
 */
const cursor_to_string = c => {
  const string_array = c.map(
    tuple => {
      // This will reinforce strings using commas as
      // we search for leading+trailing commas during parsing
      if(typeof tuple[1]==='string') {
        return `${tuple[0]}:'${tuple[1]}'`
      }
      return `${tuple[0]}:${tuple[1]}`
    }
  );
  return string_array_to_string(string_array);
}

/**
 * @description Convert an `ApiQuery` into a `URLSearchParams`
 * @param {ApiQuery<any>} q 
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
    { cursor: q.equals, key: EQUALS},
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


/**
 * @description Convert an object into a `URLSearchParams`
 * @param {Record<string, string | number | boolean>} o 
 */
export const object_to_search_params = o => {
  // @ts-ignore
  return new URLSearchParams(o);
}