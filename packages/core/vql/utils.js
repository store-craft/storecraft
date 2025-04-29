/**
 * @import { 
 *  legal_value_types, PickKeysByValueType, 
 *  PropertiesOPS, VQL, VQL_BASE, VQL_OPS 
 * } from "./types.js";
 */
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
  ).join(' ');
}

/**
 * @template {any} T
 * @template {PickKeysByValueType<T, legal_value_types>} [K=PickKeysByValueType<T, legal_value_types>]
 * @typedef {object} ReduceVQL_MapLeaf_Input
 * @property {K} name
 * @property {VQL_OPS<T[K]>} op
 */

/**
 * @template Type
 * @template MapLeafResult
 * @template AndReduceResult
 * @template OrReduceResult
 * @template NotReduceResult
 * @template SearchReduceResult
 * @typedef {object} ReduceVQL_Input
 * @prop {VQL<Type>} vql
 * @prop {(input: ReduceVQL_MapLeaf_Input<Type>) => MapLeafResult} map_leaf
 * @prop {(input: (
 *  MapLeafResult | AndReduceResult | OrReduceResult | 
 *  NotReduceResult | SearchReduceResult)[]
 * ) => AndReduceResult} reduce_AND
 * @prop {(input: (AndReduceResult)[]) => OrReduceResult} reduce_OR
 * @prop {(input: (AndReduceResult)) => NotReduceResult} reduce_NOT
 * @prop {(input: string) => SearchReduceResult} reduce_SEARCH
 */

/**
 * @description A helper to `reduce` / `transfrom` the **VQL** into anything.
 * @template Type
 * @template MapLeafResult
 * @template AndReduceResult
 * @template OrReduceResult
 * @template NotReduceResult
 * @template SearchReduceResult
 * @param {ReduceVQL_Input<
 *  Type, MapLeafResult, AndReduceResult, OrReduceResult, 
 *  NotReduceResult, SearchReduceResult
 * >} input
 */
export const reduce_vql = (
  {
    vql,
    map_leaf,
    reduce_OR,
    reduce_AND,
    reduce_NOT,
    reduce_SEARCH,
  }
) => {

  /**
   * @param {VQL<Type>} node 
   * @returns {AndReduceResult}
   */
  const process_node = (node) => {
    const parts = []
    const entries = Object.entries(node);

    // base operators
    const entries_vql_base = entries.filter(
      ([key, _]) => /** @type {string[]} */(
        /** @satisfies {(keyof VQL_BASE)[]} */(
          ['$and', '$or', '$not', '$search']
        )
      ).includes(key)
    );

    // properties with vql
    const entries_vql_props = entries.filter(
      ([key, value]) => !['$and', '$or', '$not', '$search'].includes(key)
    );

    // iterate over the base operators `$and`, `$or`, `$not`, `$search`
    for(const [key, value] of entries_vql_base) {
      const key_casted = /** @type {keyof VQL_BASE}*/(key);
      
      if(key_casted==='$and') {
        const value_casted = /** @type {VQL_BASE["$and"]}*/(
          value
        );
        parts.push(
          reduce_AND(
            value_casted.map(process_node)
          )
        );
      }
      
      if(key_casted==='$or') {
        const value_casted = /** @type {VQL_BASE["$or"]}*/(
          value
        );
        parts.push(
          reduce_OR(
            value_casted.map(process_node)
          )
        );
      }
      
      if(key_casted==='$not') {
        const value_casted = /** @type {VQL_BASE["$not"]}*/(
          value
        );
        parts.push(
          reduce_NOT(
            process_node(value_casted)
          )
        );
      }
      
      if(key_casted==='$search') {
        const value_casted = /** @type {VQL_BASE["$search"]}*/(
          value
        );
        parts.push(
          reduce_SEARCH(
            value_casted
          )
        );
      }
    }

    // iterate over the properties operators, example `{ prop: { '$eq': value } }`
    // These are the leaves of the VQL tree
    for(const [key, value] of entries_vql_props) {
      // only simple properties
      const key_casted = /** @type {PickKeysByValueType<Type, legal_value_types>} */(key);
      const value_casted = /** @type {PropertiesOPS<Type>[keyof PropertiesOPS<Type>]} */(
        value
      );

      parts.push(
        map_leaf(
          {
            name: key_casted,
            op: value_casted,
          }
        )
      );
    }

    return reduce_AND(
      parts
    );
  }

  return process_node(vql);
}

/**
 * @description Given a VQL string and an object, test if the object 
 * matches the VQL filters and ops.
 * @template {any} T object type
 * @param {VQL<T>} vql a VQL string
 * @param {T} o an object to test against
 * @param {string[]} [search=[]] seacrh index for `$search` operator
 * @param {boolean} [debug=false] debug mode, prints the test results
 * @returns {boolean}
 */
export const test_vql_against_object = (
  vql,
  o,
  search = [],
  debug = false
) => {

  /**
   * @template T
   * @param {T} fn 
   * @returns {T}
   */
  const identity = (fn) => {
    return fn;
  }

  /**
   * @param {VQL_OPS<any>} ops 
   * @param {any} value 
   * @param {string} name 
   */
  const test_ops = (ops, value, name) => {
    const ops_keys = /** @type {(keyof VQL_OPS)[]} */(
      Object.keys(ops)
    );
    const values = ops_keys.map(
      (k) => {
        const arg = ops[k];
        let result;

        switch (k) {
          case '$eq':
            result = value===arg;
            break;
          case '$ne':
            result = value!==arg;
            break;
          case '$gt':
            result = value>arg;
            break;
          case '$gte':
            result = value>=arg;
            // console.log('$gte ', {value, arg, result, name})
            break;
          case '$lt':
            result = value<arg;
            break;
          case '$lte':
            result = value<=arg;
            break;
          case '$like':
            result = Boolean(
              String(value)
              .match(
                new RegExp(
                  String(arg)
                  .replace(/%/g, '.*')
                  .replace(/_/g, '.')
                )
              )
            );
            break;
          case '$in': {
            const arg_array = 
              Array.isArray(arg) ? arg : [arg];
            result = arg_array.includes(value);
            break;
          }
          case '$nin': {
            const arg_array = 
              Array.isArray(arg) ? arg : [arg];
            result = !arg_array.includes(value);
            break;
          }
          default:
            if(result===undefined)
              throw new Error('VQL-ops-failed');
        }

        if(debug) {
          console.log(
            'test_ops',
            {k, arg, value, result}
          )
        }

        return result;
      }
    );
    return values.reduce(
      (acc, v) => {
        return acc && v;
      },
      true
    );
  }

  const reduced = reduce_vql(
    {
      vql,
      map_leaf: (node) => {
        return test_ops(
          node.op, 
          o[node.name], 
          String(node.name)
        );
      },
      reduce_AND: identity(
        (nodes) => {
          return nodes.reduce(
            (acc, v) => {
              return acc && v;
            },
            true
          );
        }
      ),
      reduce_OR: (nodes) => {
        return nodes.reduce(
          (acc, v) => {
            return acc || v;
          },
          false
        );
      },
      reduce_NOT: (node) => {
        return !node;
      },
      reduce_SEARCH: (value) => {
        return search.includes(value);
      },
    }
  );

  return reduced;
}