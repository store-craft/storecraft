/**
 * @import { VQL } from './types.js';
 * @import { BOOLQL } from './bool-ql/types.js';
 */
import { parse as parseBoolQL } from './bool-ql/index.js';

/**
 * @template {any} [T=any]
 * @param {BOOLQL.Node} node 
 * @returns {VQL<T>}
 */
const boolql_node_to_vql = (node) => {
  switch (node.op) {
    case '&':
      return {
        $and: node.args.map(boolql_node_to_vql)
      }
    case '|':
      return {
        $or: node.args.map(boolql_node_to_vql)
      }
    case '!':
      return {
        $not: boolql_node_to_vql(node.args[0])
      }
    case 'LEAF':
      // this is the leaf node
      return {
        op: 'leaf',
        args: [node.value]
      }
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