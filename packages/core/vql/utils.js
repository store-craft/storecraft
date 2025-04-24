import { assert } from "./parse.utils.js";

/**
 * @description Pad a VQL string with leading and trailing `()`
 * @param {string} vql 
 */
export const parenthesise_vql_string = (vql='') => {
  if(!vql)
    return vql;

  assert(
    typeof vql === 'string',
    'pad_vql_string:: vql must be a string'
  );

  vql = vql.trim();

  if(vql.startsWith('(') && vql.endsWith(')'))
    return vql;
  return '(' + vql + ')';
}

/**
 * @description Combine multiple VQL strings into one intelligently.
 * If more than one string is passed, it will be combined with `&`
 * and each will be parenthesised.
 * @param {...string} vqls 
 */
export const combine_vql_strings = (...vqls) => {
  if(!vqls || vqls.length===0)
    return undefined;

  let parts = vqls.filter(Boolean);

  if(parts.length===1)
    return parts[0];

  return parts.map(
    parenthesise_vql_string
  ).join(' & ');
}

