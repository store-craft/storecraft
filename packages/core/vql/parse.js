/**
 * @import { legal_value_types, VQL_OPS, VQL } from './types.js';
 * @import { BOOLQL } from './bool-ql/types.js';
 */
import { parse as parseBoolQL } from './bool-ql/index.js';
import { 
  assert, INNER_STRING_OPS_MAP, parse_string_as_type 
} from './parse.utils.js';

export const string_arg_to_typed_arg = (arg='') => {
  return parse_string_as_type(arg);
}

/**
 * @description
 * Parse a BoolQL leaf node value to get the operation and arguments
 * embedded in the string value.
 * returns:
 * - `op`: the binary operation
 * - `arg_0`: the first argument, always a string for the property key.
 * - `arg_1`: the second argument
 * @param {string} value 
 * @returns {{op?: keyof VQL_OPS, arg_0?: string, arg_1?: legal_value_types}}
 */
const parse_boolql_leaf_node_string_value = (value) => {
  assert(
    value && (typeof value === 'string'),
    'VQL-failed, expected LEAF node with value'
  );

  value = value.trim();

  // we need to do it in order and priority
  const ops = Object.keys(INNER_STRING_OPS_MAP).join('|');
  const regex = new RegExp(`(${ops})`, 'g');

  // console.log('regex', regex);

  const matches = Array.from(value.matchAll(regex));
  if (matches.length === 0) {
    return {
      // special case.
      op: undefined,
      arg_0: undefined,
      arg_1: value
    }
  }
  
  const op = /** @type {keyof typeof INNER_STRING_OPS_MAP} */ (
    matches[0][1]
  );

  assert(
    op in INNER_STRING_OPS_MAP,
    'VQL-failed, expected operation in INNER_STRING_OPS_MAP'
  );
  
  const parts = value.split(op);
  // the first part is always the key of the property
  const arg_0 = parts[0].trim();
  // combine the rest of the parts
  let arg_1 = string_arg_to_typed_arg(
    parts.slice(1).join(op).trim()
  );

  if(op==='~') {
    // `$like` operator is a special case and always a `string`
    arg_1 = String(arg_1);
  }

  return {
    op: INNER_STRING_OPS_MAP[op],
    arg_0,
    arg_1
  }
}

/**
 * @param {BOOLQL.Node} node 
 * @returns {{[x: string]: VQL_OPS<any>} | { search?: string}}}
 */
const boolql_leaf_node_to_vql = (node) => {
  assert(
    node.op === 'LEAF',
    'VQL-failed, expected LEAF node'
  );
  assert(
    node.value,
    'VQL-failed, expected LEAF node with value'
  );

  const {
    op, arg_0, arg_1
  } = parse_boolql_leaf_node_string_value(node.value);

  if(op === undefined) {
    // this is a special case
    return {
      search: String(arg_1)
    }
  }

  return {
    [arg_0]: {
      [op]: arg_1
    }
  }
}


/**
 * @template {any} [T=any]
 * @param {BOOLQL.Node} node 
 * @returns {VQL<T>}
 */
const boolql_node_to_vql = (node) => {
  switch (node.op) {
    case '&':
      return /** @type {VQL<T>} */({
        $and: node.args.map(
          /** @type {typeof boolql_node_to_vql<T>} */(
            boolql_node_to_vql
          )
        )
      }
    )
    case '|':
      return /** @type {VQL<T>} */({
        $or: node.args.map(boolql_node_to_vql)
      }
    )
    case '!':
      return /** @type {VQL<T>} */({
        $not: boolql_node_to_vql(node.args[0])
      }
    )
    case 'LEAF':
      // this is the leaf node
      return /** @type {VQL<T>} */(
        boolql_leaf_node_to_vql(node)
      )
    default:
      throw new Error('VQL-failed, unknown operator: ' + node.op);
  }
}

/**
 * @description
 * Parse a string into {@link VQL}
 * @template {any} [T=any]
 * @param {string} vql 
 * @returns {VQL<T> | undefined}
 */
export const parse = (vql) => {
  /** @type {BOOLQL.Node} */
  let ast;

  try {
    ast = parseBoolQL(vql);
  } catch (e) {
    console.error('boolql failed with ', e);
    return undefined;
  }

  // walk on the AST and transform it to VQL
  return boolql_node_to_vql(ast);
}
