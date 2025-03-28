/**
 * @import { AliasableExpression, Expression} from 'kysely'
 * @import { SelectQueryBuilderExpression } from './con.helpers.json.js'
 * @import { SqlDialectType } from '../types.public.js'
 * @import { RawBuilder, Simplify } from 'kysely'
 */
import { SelectQueryNode, sql } from "kysely"
import { 
  extract_first_selection, getJsonObjectArgs 
} from "./con.helpers.json.js"

/**
 * A MySQL helper for aggregating a subquery into a JSON array.
 *
 * NOTE: This helper is only guaranteed to fully work with the built-in `MysqlDialect`.
 * While the produced SQL is compatible with all MySQL databases, some 3rd party dialects
 * may not parse the nested JSON into arrays. In these cases you can use the built in
 * `ParseJSONResultsPlugin` to parse the results.
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
 * The generated SQL (MySQL):
 *
 * ```sql
 * select `id`, (
 *   select cast(coalesce(json_arrayagg(json_object(
 *     'pet_id', `agg`.`pet_id`,
 *     'name', `agg`.`name`
 *   )), '[]') as json) from (
 *     select `pet`.`id` as `pet_id`, `pet`.`name`
 *     from `pet`
 *     where `pet`.`owner_id` = `person`.`id`
 *     order by `pet`.`name`
 *   ) as `agg`
 * ) as `pets`
 * from `person`
 * ```
 * 
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @returns {RawBuilder<Simplify<O>[]>}
 */
export function mysql_jsonArrayFrom(expr) {
  return sql`(select cast(coalesce(json_arrayagg(json_object(${
    sql.join(
      getMysqlJsonObjectArgs(
        /** @type {SelectQueryNode} */(expr.toOperationNode()), 
        'agg'
      ),
    )
  })), '[]') as json) from ${expr} as agg)`
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
 * @returns {RawBuilder<string[]>}
 */
export function mysql_stringArrayFrom(expr) {
  const arg = extract_first_selection(expr, 'agg');
  return sql`(select cast(coalesce(json_arrayagg(${sql.join([arg])}), '[]') as json) from ${expr} as agg)`
}


/**
 * A MySQL helper for turning a subquery into a JSON object.
 *
 * The subquery must only return one row.
 *
 * NOTE: This helper is only guaranteed to fully work with the built-in `MysqlDialect`.
 * While the produced SQL is compatible with all MySQL databases, some 3rd party dialects
 * may not parse the nested JSON into objects. In these cases you can use the built in
 * `ParseJSONResultsPlugin` to parse the results.
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
 * The generated SQL (MySQL):
 *
 * ```sql
 * select `id`, (
 *   select json_object(
 *     'pet_id', `obj`.`pet_id`,
 *     'name', `obj`.`name`
 *   ) from (
 *     select `pet`.`id` as `pet_id`, `pet`.`name`
 *     from `pet`
 *     where `pet`.`owner_id` = `person`.`id`
 *     and `pet`.`is_favorite` = ?
 *   ) as obj
 * ) as `favorite_pet`
 * from `person`
 * ```
 * 
 * @template O
 * @param {SelectQueryBuilderExpression<O>} expr 
 * @returns {RawBuilder<Simplify<O> | null>}
 */
export function mysql_jsonObjectFrom(expr) {
  return sql`(select json_object(${
    sql.join(
      getMysqlJsonObjectArgs(
        /** @type {SelectQueryNode} */(expr.toOperationNode()), 
        'obj'
      ),
    )
  }) from ${expr} as obj)`
}

/**
 * The MySQL `json_object` function.
 *
 * NOTE: This helper is only guaranteed to fully work with the built-in `MysqlDialect`.
 * While the produced SQL is compatible with all MySQL databases, some 3rd party dialects
 * may not parse the nested JSON into objects. In these cases you can use the built in
 * `ParseJSONResultsPlugin` to parse the results.
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
 *       full: eb.fn('concat', ['first_name', eb.val(' '), 'last_name'])
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
 * The generated SQL (MySQL):
 *
 * ```sql
 * select "id", json_object(
 *   'first', first_name,
 *   'last', last_name,
 *   'full', concat(`first_name`, ?, `last_name`)
 * ) as "name"
 * from "person"
 * ```
 * 
 * @template {Record<string, Expression<unknown>>} O
 * @param {O} obj 
 * @returns {RawBuilder<Simplify<{[K in keyof O]: O[K] extends Expression<infer V> ? V : never}>>}
 */
export function mysql_jsonBuildObject(obj) {
  return sql`json_object(${
    sql.join(
      Object.keys(obj).flatMap((k) => [sql.lit(k), obj[k]]),
    )
  })`
}

/**
 * 
 * @param {SelectQueryNode} node 
 * @param {string} table 
 * @returns {Expression<unknown>[]}
 */
function getMysqlJsonObjectArgs(node, table) {
  try {
    return getJsonObjectArgs(node, table)
  } catch {
    throw new Error(
      'MySQL jsonArrayFrom and jsonObjectFrom functions can only handle explicit selections due to limitations of the json_object function. selectAll() is not allowed in the subquery.',
    )
  }
}