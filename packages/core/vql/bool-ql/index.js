/**
 * @import { BOOLQL } from './types.js';
 */
import {
  SyntaxError, 
  parse as parseBoolQL
} from './generated.js'

/**
 * @param {string} input 
 * @param {any} options 
 */
const parse = (input, options=undefined) => {
  const ast = /** @type {BOOLQL.Node} */ (parseBoolQL(input, options));
  return ast;
}

export {
  SyntaxError,
  parse
};
