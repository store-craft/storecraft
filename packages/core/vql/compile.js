/**
 * @import { 
 *  legal_value_types, VQL_OPS, VQL, 
 *  VQL_STRING_OPS, VQL_BASE 
 * } from './types.js';
 */

import { 
  assert,
  is_legal_value_type, 
  REVERSE_INNER_STRING_OPS_MAP 
} from './parse.utils.js';

/**
 * @description Given a string value,
 * if it contains more than one word,
 * it will be quoted with double quotes.
 * Otherwise, it will be returned as is.
 * @param {any} value 
 * @returns 
 */
const double_quote_multi_word_if_string = (value) => {
  if(!(typeof value === 'string')) 
    return value;

  const words_count = value.match(/\S+/g).length;
  return words_count > 1 ?
    `"${value}"` : 
    value;
}

/**
 * @description
 * Compile a VQL object into a string
 * @param {VQL} vql 
 */
export const compile = (vql) => {

  if(vql===undefined) {
    return '';
  }

  assert(
    typeof vql === 'object',
    'VQL-Compile, you tried to compile a non-object value ' + vql
  );

  /** @type {string[]} */
  const parts = [];

  for(const [key, value] of Object.entries(vql)) {

    const key_casted = /** @type {keyof VQL_BASE} */(key);
    if(key_casted === '$search') {
      const value_string = String(value);

      // console.log({words_count, value_string});
      
      parts.push(
        double_quote_multi_word_if_string(value_string)
      );
      continue;
    }
    else if(key_casted === '$and') {
      parts.push(
        '(' + (
          /** @type {VQL["$and"]} */(value)
        )
        .map(compile)
        .join(' & ')
        + ')'
      );
      continue;
    }
    else if(key_casted === '$or') {
      parts.push(
        '(' + (
          /** @type {VQL["$or"]} */(value)
        )
        .map(compile)
        .join(' | ')
        + ')'
      );
      continue;
    }
    if(key_casted === '$not') {
      parts.push(
        '-' + compile(
          /** @type {VQL["$not"]} */(value)
        )
      );
      continue;
    }
    else {
      /**
       * we are in OPS town,
       * - Each key is a property name
       * - Each value is a {@link VQL_OPS}
       */
      const value_casted = (
        /** @type {VQL_OPS} */(value)
      );

      assert(
        typeof value_casted === 'object',
        'VQL-failed, expected VQL_OPS'
      );

      for(const [op_key, op_value] of Object.entries(value_casted)) {
        const op_key_casted = (
          /** @type {keyof VQL_OPS} */(op_key)
        );

        assert(
          op_key_casted!=='$in' && op_key_casted!=='$nin',
          'VQL-Compile failed, `$in` and `$nin` are currently not supported\
          for VQL compile. Will be supported soon by converting them to `|` operators.'
        );

        assert(
          op_key_casted in REVERSE_INNER_STRING_OPS_MAP,
          `VQL-Compile failed, ${op_key_casted} is not legal operation`
        );

        // TODO: in the future we will support $in and $nin
        // which support arrays of legal value types.
        assert(
          is_legal_value_type(op_value),
          `VQL-Compile failed, ${op_value} is not of type string, number or boolean`
        );

        /**
         * `final` has the form {name}{op}{value}, example `updated>=2010-20-10`
         */
        const final = (
          key + 
          REVERSE_INNER_STRING_OPS_MAP[op_key_casted] + 
          double_quote_multi_word_if_string(op_value)
        );

        // This will count as `&` operator.
        parts.push(final); 
      }
    }
  }

  // `space` is equivalent to `&` operator
  return parts.join(' ');
}