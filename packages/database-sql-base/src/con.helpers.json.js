import {
  AliasNode, ColumnNode, ExpressionWrapper, IdentifierNode, 
  ReferenceNode, SelectQueryNode, TableNode, ValueNode, sql} from 'kysely'

  
/**
 * @template O
 * @typedef {Object} _SelectQueryBuilderExpression
 * @property {boolean} isSelectQueryBuilder
 * @property {() => SelectQueryNode} toOperationNode
 */

/**
 * @template O
 * @typedef {import('kysely').AliasableExpression<O> & _SelectQueryBuilderExpression<O>} SelectQueryBuilderExpression
 * @property {boolean} isSelectQueryBuilder
 * @property {(): SelectQueryNode} toOperationNode
 */


/**
 * 
 * @param {SelectQueryNode} node 
 * @param {string} table 
 * @returns {import('kysely').Expression<unknown>[] }
 */
export function getJsonObjectArgs(node, table) {
  /** @type {import('kysely').Expression<unknown>[] } */
  const args = []

  for (const { selection: s } of node.selections ?? []) {
    
    if (ReferenceNode.is(s) && ColumnNode.is(s.column)) {
      args.push(
        colName(s.column.column.name),
        colRef(table, s.column.column.name),
      )
    } else if (ColumnNode.is(s)) {
      args.push(colName(s.column.name), colRef(table, s.column.name))
    } else if (AliasNode.is(s) && IdentifierNode.is(s.alias)) {
      args.push(colName(s.alias.name), colRef(table, s.alias.name))
    } else {
      throw new Error(`can't extract column names from the select query node`)
    }
  }

  return args
}

/**
 * 
 * @param {string} col 
 * @returns {import('kysely').Expression<unknown> }
 */
function colName(col) {
  return new ExpressionWrapper(ValueNode.createImmediate(col))
}

/**
 * 
 * @param {string} table 
 * @param {string} col 
 * @returns {import('kysely').Expression<unknown> }
 */
function colRef(table, col) {
  return new ExpressionWrapper(
    ReferenceNode.create(ColumnNode.create(col), TableNode.create(table)),
  )
}

/**
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @param {string} table 
 * @returns {import('kysely').Expression<unknown>}
 */
export const extract_first_selection = (expr, table) => {
  /** @type {any} */
  let s_ = expr.toOperationNode();
  /** @type {SelectQueryNode} */
  const s__ = s_;
  const s = s__.selections[0].selection;
  /** @type {import('kysely').Expression<unknown>} */
  let arg;
  if (ReferenceNode.is(s) && ColumnNode.is(s.column)) {
    // console.log('arg ', s)
    arg = colRef(table, s.column.column.name);
  } else if (ColumnNode.is(s)) {
    arg = colRef(table, s.column.name);
    // console.log('arg ', 2)
  } else if (AliasNode.is(s) && IdentifierNode.is(s.alias)) {
    arg = colRef(table, s.alias.name);
    // console.log('arg ', 3)
  } else {
    throw new Error(`can't extract column names from the select query node`)
  } 
  return arg;
}
