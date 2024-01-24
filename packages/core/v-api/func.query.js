import { parse } from "../v-ql/index.js";
import { assert } from "./utils.js";

/**
 * @typedef {import("../types.api.query").ParsedApiQuery} ParsedApiQuery
 * @typedef {import("../types.api.query").Cursor<string>} Cursor
 */


const ORDER = 'order';
const LIMIT = 'limit';
const Q = 'q';
const START_AT = 'startAt';
const START_AFTER = 'startAfter';
const END_AT = 'endAt';
const END_BEFORE = 'endBefore';

const UPDATED = 'updated';
const CREATED = 'created';
const ID = 'id';


/**
 * (updated/created:2010-20-10,id:my-id) => [['updated', '2010-20-10'], ['id', 'my-id']]
 * 
 * @param {string} cursor_str 
 * @returns {Cursor[] | undefined}
 */
const parse_cursor = (cursor_str="") => {
  if(!cursor_str)
    return undefined;
  const reg_prefix = /(^[^\w]+)/g;
  const reg_postfix = /([^\w]+$)/g;
  
  let a = cursor_str.match(reg_prefix);
  let b = cursor_str.match(reg_postfix);

  let sub = cursor_str.substring(a?.[0].length??0);
  sub = sub.substring(0, sub.length - (b?.[0].length??0));

  if(sub==='')
    return undefined;

  return sub.split(',')
            .map(
              s => {
                const parts = s.split(':');
                console.log(parts)
                return [
                  parts[0].trim(),
                  parts.slice(1).join(':').trim()
                ]
              }
            )
}

/**
 * Parse a query such as:
 * q="tag:a (tag:b)"&limit=10&startAt=(updated:2012,id:tomer)&order=asc
 * INTO a {ParsedApiQuery}
 * 
 * @param {URLSearchParams} s 
 * @returns {ParsedApiQuery | undefined}
 */
export const parse_query = (s) => {
  /** @type {ParsedApiQuery} */
  const q = {};
  q.order = s.get(ORDER)==='desc' ? 'desc' : 'asc';
  q.limit = Math.abs(parseInt(s.get(LIMIT))) || 10;

  // vql
  try {
    const vql = s.get(Q);
    console.log(vql);

    if(vql) {
      q.q = parse(vql);
    }
  } catch (e) {
    console.log(e);

    assert(false, 'VQL parsing failed: q', 401);
  }

  // parse cursors
  q.startAt = parse_cursor(s.get(START_AT));
  if(!q.startAt) {
    q.startAfter = parse_cursor(s.get(START_AFTER))
  }

  q.endAt = parse_cursor(s.get(END_AT));
  if(!q.endAt) {
    q.endBefore = parse_cursor(s.get(END_BEFORE))
  }
  
  return q;
}