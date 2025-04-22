/**
 * @import { legal_value_types, OPS, VQL } from './types.js';
 * @import { BOOLQL } from './bool-ql/types.js';
 */

/**
 * @param {any} condition 
 * @param {string} message 
 */
export const assert = (condition, message) => {
  if (!Boolean(condition)) {
    throw new Error(message);
  }
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
 * 4. indirect-string: if does not start+end with commas '..', "..", we cast it as string
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
