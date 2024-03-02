// import { Expression } from '../expression/expression.js'
// import { SelectQueryNode } from '../operation-node/select-query-node.js'
// import { SelectQueryBuilderExpression } from '../query-builder/select-query-builder-expression.js'
// import { RawBuilder } from '../raw-builder/raw-builder.js'
// import { sql } from '../raw-builder/sql.js'
// import { getJsonObjectArgs } from '../util/json-object-args.js'
// import { Simplify } from '../util/type-utils.js'
import {AliasNode, ColumnNode, ExpressionWrapper, IdentifierNode, 
  ReferenceNode, 
  SelectQueryNode, TableNode, ValueNode, sql} from 'kysely'

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
 * A SQLite helper for aggregating a subquery into a JSON array.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new SqliteDialect(config),
 *   plugins: [new ParseJSONResultsPlugin()]
 * })
 * ```
 *
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
 *
 * The generated SQL (SQLite):
 *
 * ```sql
 * select "id", (
 *   select coalesce(json_group_array(json_object(
 *     'pet_id', "agg"."pet_id",
 *     'name', "agg"."name"
 *   )), '[]') from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     order by "pet"."name"
 *   ) as "agg"
 * ) as "pets"
 * from "person"
 * ```
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @returns {import('kysely').RawBuilder<import('kysely').Simplify<O>[]>}
 */
export function jsonArrayFrom(expr) {

  return sql`(select coalesce(json_group_array(json_object(${sql.join(
    getSqliteJsonObjectArgs(expr.toOperationNode(), 'agg')
  )})), '[]') from ${expr} as agg)`
}


/**
 * A SQLite helper for aggregating a subquery into a JSON array.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new SqliteDialect(config),
 *   plugins: [new ParseJSONResultsPlugin()]
 * })
 * ```
 *
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
 *
 * The generated SQL (SQLite):
 *
 * ```sql
 * select "id", (
 *   select coalesce(json_group_array("agg"."name"), '[]') from (
 *     select "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     order by "pet"."name"
 *   ) as "agg"
 * ) as "pets"
 * from "person"
 * ```
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @returns {import('kysely').RawBuilder<import('kysely').Simplify<O>[]>}
 */
export function stringArrayFrom(expr) {
  const arg = extract_first_selection(expr);
  return sql`(select coalesce(json_group_array(${sql.join([arg])}), '[]') from ${expr} as agg)`
}

/**
 * A SQLite helper for turning a subquery into a JSON object.
 *
 * The subquery must only return one row.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new SqliteDialect(config),
 *   plugins: [new ParseJSONResultsPlugin()]
 * })
 * ```
 *
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
 * The generated SQL (SQLite):
 *
 * ```sql
 * select "id", (
 *   select json_object(
 *     'pet_id', "obj"."pet_id",
 *     'name', "obj"."name"
 *   ) from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     and "pet"."is_favorite" = ?
 *   ) as obj
 * ) as "favorite_pet"
 * from "person";
 * ```
 * 
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @returns {import('kysely').RawBuilder<import('kysely').Simplify<O> | null>}
 */
export function jsonObjectFrom(expr) {
  return sql`(select json_object(${sql.join(
    getSqliteJsonObjectArgs(expr.toOperationNode(), 'obj'),
  )}) from ${expr} as obj)`
}

/**
 * The SQLite `json_object` function.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new SqliteDialect(config),
 *   plugins: [new ParseJSONResultsPlugin()]
 * })
 * ```
 *
 * ### Examples
 *
 * ```ts
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     jsonBuildObject({
 *       first: eb.ref('first_name'),
 *       last: eb.ref('last_name'),
 *       full: sql<string>`first_name || ' ' || last_name`
 *     }).as('name')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].name.first
 * result[0].name.last
 * result[0].name.full
 * ```
 *
 * The generated SQL (SQLite):
 *
 * ```sql
 * select "id", json_object(
 *   'first', first_name,
 *   'last', last_name,
 *   'full', "first_name" || ' ' || "last_name"
 * ) as "name"
 * from "person"
 * ```
 */
// export function jsonBuildObject<O extends Record<string, Expression<unknown>>>(
//   obj: O,
// ): RawBuilder<
//   Simplify<{
//     [K in keyof O]: O[K] extends Expression<infer V> ? V : never
//   }>
// > {
//   return sql`json_object(${sql.join(
//     Object.keys(obj).flatMap((k) => [sql.lit(k), obj[k]]),
//   )})`
// }


/**
 * 
 * @param {SelectQueryNode} node 
 * @param {string} table 
 * @returns {import('kysely').Expression<unknown>[]}
 */
function getSqliteJsonObjectArgs(node, table) {
  try {
    return getJsonObjectArgs(node, table)
  } catch {
    throw new Error(
      'SQLite jsonArrayFrom and jsonObjectFrom functions can only handle explicit selections due to limitations of the json_object function. selectAll() is not allowed in the subquery.',
    )
  }
}

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
 * @returns {import('kysely').Expression<unknown>}
 */
export const extract_first_selection = expr => {
  /** @type {any} */
  let s_ = expr.toOperationNode();
  /** @type {SelectQueryNode} */
  const s__ = s_;
  const s = s__.selections[0].selection;
  const table = 'agg';
  /** @type {import('kysely').Expression<unknown} */
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
