/**
 * @import { 
 *  Cursor, Tuple
 * } from './types.api.query.js';
 */

export const REGEX_ALLOWED_CHARS = /[a-zA-Z0-9\_\:\-\+\*\s\'\"\.\=]+/g

/**
 * @description Is the string a number
 * - '5' => true
 * - 'hello' => false
 * @param {string} str 
 */
export function is_string_a_number(str='') {
  // we only process strings!
  if (typeof str != "string") 
    return false 

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
 * - (updated:2010-20-10,id:my-id) => 
 * [['updated', '2010-20-10'], ['id', 'my-id']]
 * - updated:2010-20-10 ,  id:my-id => 
 * [['updated', '2010-20-10'], ['id', 'my-id']]
 * - updated:2010-20-10|id:my-id => 
 * [['updated', '2010-20-10'], ['id', 'my-id']]
 * @param {string} str 
 * @returns {Tuple<string>[]}
 */
export const parse_tuples = (str="") => {
  if(!str) 
    return undefined;

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
 * @description Given a string query, that represents 
 * a Delmiter NOT from `[a-zA-Z0-9_:-]`, then parse 
 * it into list.
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
export const parse_list_from_string = (
  q='', defaultList=[]
) => {
  const list = (
    q?.match(
      REGEX_ALLOWED_CHARS
    )
    .map(
      p => p.trim()
    )?.filter(Boolean)
  ) ?? defaultList;

  return list;
}

/**
 * @description Parse a number from string
 * - '5' => 5
 * - '5.5' => 5.5
 * - '5.5.5' => NaN
 * @param {string} q 
 * @param {number} [defaultValue=Number.NaN] 
 * @returns {number | undefined}
 */
export const parse_number_from_string = (
  q, defaultValue=Number.NaN
) => {
  if(is_string_a_number(q))
    return parseFloat(q);
  return defaultValue;
}


/**
 * @description Convert a string array into a string
 * - ['a', 'b', 'c'] => '(a,b,c)'
 * @param {string[]} array 
 * @param {string} [defaultValue] 
 */
export const string_array_to_string = (
  array, defaultValue
) => {
  if(!(Array.isArray(array)))
    return defaultValue;
  
  const fill = array.join(',');
  return '(' + fill + ')';
}

/**
 * @description Convert a cursor into a string
 * @param {Cursor} c 
 */
export const cursor_to_string = c => {
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

