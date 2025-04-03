/**
 * @import { AliasableExpression, Expression} from 'kysely'
 * @import { SelectQueryBuilderExpression } from './con.helpers.json.js'
 * @import { SqlDialectType } from '../types.public.js'
 * @import { RawBuilder, Simplify } from 'kysely'
 */

import {
  AliasNode, ColumnNode, ExpressionWrapper, IdentifierNode, 
  ReferenceNode, SelectQueryNode, TableNode, ValueNode } from 'kysely'
import { 
  sqlite_jsonArrayFrom, sqlite_jsonObjectFrom, 
  sqlite_stringArrayFrom 
} from './con.helpers.json.sqlite.js'
import { 
  pg_jsonArrayFrom, pg_jsonObjectFrom, 
  pg_stringArrayFrom 
} from './con.helpers.json.postgres.js'
import { 
  mysql_jsonArrayFrom, mysql_jsonObjectFrom, 
  mysql_stringArrayFrom 
} from './con.helpers.json.mysql.js'

  
/**
 * @template O
 * @typedef {Object} _SelectQueryBuilderExpression
 * @property {boolean} isSelectQueryBuilder
 * @property {() => SelectQueryNode} toOperationNode
 */

/**
 * @template O
 * @typedef {AliasableExpression<O> & _SelectQueryBuilderExpression<O>} SelectQueryBuilderExpression
 * @property {boolean} isSelectQueryBuilder
 * @property {(): SelectQueryNode} toOperationNode
 */


/**
 * 
 * @param {SelectQueryNode} node 
 * @param {string} table 
 * @returns {Expression<unknown>[] }
 */
export function getJsonObjectArgs(node, table) {
  /** @type {Expression<unknown>[] } */
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
 * @returns {Expression<unknown> }
 */
function colName(col) {
  return new ExpressionWrapper(ValueNode.createImmediate(col))
}

/**
 * 
 * @param {string} table 
 * @param {string} col 
 * @returns {Expression<unknown> }
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
 * @returns {Expression<unknown>}
 */
export const extract_first_selection = (expr, table) => {
  /** @type {any} */
  let s_ = expr.toOperationNode();
  /** @type {SelectQueryNode} */
  const s__ = s_;
  const s = s__.selections[0].selection;
  /** @type {Expression<unknown>} */
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

/**
 * ### Examples
 *
 * ```ts
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     jsonArrayFrom(
 *       eb.selectFrom('pet')
 *         .select(['pet.id as pet_id', 'pet.name'])
 *         .whereRef('pet.owner_id', '=', 'person.id')
 *         .orderBy('pet.name')
 *     ).as('pets')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].pets[0].pet_id
 * result[0].pets[0].name
 * ```
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @param {SqlDialectType} sql_type 
 * @returns {RawBuilder<Simplify<O>[]>}
 */
export function jsonArrayFrom(expr, sql_type) {
  switch(sql_type) {
    case 'SQLITE':
      return sqlite_jsonArrayFrom(expr);
    case 'POSTGRES':
      return pg_jsonArrayFrom(expr);
    case 'MYSQL':
      return mysql_jsonArrayFrom(expr);
    default:
      throw new Error(`sql_type=${sql_type} NOT SUPPORTED !`);
  }  
}


/**
 * A SQLite helper for aggregating a subquery into a JSON array.
 * ### Examples
 *
 * ```ts
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     stringArrayFrom(
 *       eb.selectFrom('pet')
 *         .select('pet.name')
 *         .whereRef('pet.owner_id', '=', 'person.id')
 *         .orderBy('pet.name')
 *     ).as('pets')
 *   ])
 *   .execute()
 *
 * result[0].pets = ['name1', 'name2', ....]
 * ```
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @param {SqlDialectType} sql_type 
 */
export function stringArrayFrom(expr, sql_type) {
  switch(sql_type) {
    case 'SQLITE':
      return sqlite_stringArrayFrom(expr);
    case 'POSTGRES':
      return pg_stringArrayFrom(expr);
    case 'MYSQL':
      return mysql_stringArrayFrom(expr);
    default:
      throw new Error(`sql_type=${sql_type} NOT SUPPORTED !`);
  }  
}


/**
 * ### Examples
 *
 * ```ts
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     jsonObjectFrom(
 *       eb.selectFrom('pet')
 *         .select(['pet.id as pet_id', 'pet.name'])
 *         .whereRef('pet.owner_id', '=', 'person.id')
 *         .where('pet.is_favorite', '=', true)
 *     ).as('favorite_pet')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].favorite_pet.pet_id
 * result[0].favorite_pet.name
 * ```
 *   
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @param {SqlDialectType} sql_type 
 * @returns {RawBuilder<Simplify<O> | null>}
 */
export function jsonObjectFrom(expr, sql_type) {
  switch(sql_type) {
    case 'SQLITE':
      return sqlite_jsonObjectFrom(expr);
    case 'POSTGRES':
      return pg_jsonObjectFrom(expr);
    case 'MYSQL':
      return mysql_jsonObjectFrom(expr);
    default:
      throw new Error(`sql_type=${sql_type} NOT SUPPORTED !`);
  }
}
