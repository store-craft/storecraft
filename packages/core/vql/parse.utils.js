/**
 * @import { 
 *  legal_value_types, VQL_OPS, VQL, VQL_STRING_OPS, 
 *  ReverseStringRecord 
 * } from './types.js';
 */

/**
 * @description map of inner string operations to VQL.
 * We put the operations in the order of priority for the regex. 
 * @satisfies {Record<VQL_STRING_OPS, keyof VQL_OPS>}
 */
export const INNER_STRING_OPS_MAP = /** @type {const} */({
  '>=': '$gte',
  '!=': '$ne',
  '<=': '$lte',

  '=': '$eq',

  '>': '$gt',

  '<': '$lt',

  '~': '$like',
});

/**
 * @description map of {@link VQL_OPS} to inner string operations.
 * @satisfies {ReverseStringRecord<typeof INNER_STRING_OPS_MAP>}
 */
export const REVERSE_INNER_STRING_OPS_MAP = /** @type {const} */({
  '$gte': '>=',
  '$ne': '!=',
  '$lte': '<=',
  '$eq': '=',
  '$gt': '>',
  '$lt': '<',
  '$like': '~'
});

/**
 * @param {any} condition 
 * @param {string} message 
 */
export const assert = (condition, message) => {
  if (!Boolean(condition)) {
    throw new Error(message);
  }
}

/**
 * @description Test if the value is a legal type {@link legal_value_types}
 * @param {any} value 
 */
export const is_legal_value_type = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return true;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  return false;
}

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
 * 4. indirect-string: if does not start+end with 
 * commas '..', "..", we cast it as string
 * @param {string} part 
 */
export const parse_string_as_type = (part='') => {
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
