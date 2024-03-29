import { sql } from "kysely"

/**
 * An MS SQL Server helper for aggregating a subquery into a JSON array.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new MssqlDialect(config),
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
 *         .modifyEnd(sql`offset 0 rows`)
 *     ).as('pets')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].pets[0].pet_id
 * result[0].pets[0].name
 * ```
 *
 * The generated SQL (MS SQL Server):
 *
 * ```sql
 * select "id", (
 *   select coalesce((select * from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     order by "pet"."name"
 *     offset 0 rows
 *   ) as "agg" for json path, include_null_values), '[]')
 * ) as "pets"
 * from "person"
 * ```
 * 
 * @template O
 * @param {import("kysely").Expression<O>} expr 
 * @returns {import("kysely").RawBuilder<import("kysely").Simplify<O>[]>}
 */
export function mssql_jsonArrayFrom(expr) {
  return sql`coalesce((select * from ${expr} as agg for json path, include_null_values), '[]')`
}

/**
 * An MS SQL Server helper for aggregating a subquery into a JSON array.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new MssqlDialect(config),
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
 *         .modifyEnd(sql`offset 0 rows`)
 *     ).as('pets')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].pets[0].pet_id
 * result[0].pets[0].name
 * ```
 *
 * The generated SQL (MS SQL Server):
 *
 * ```sql
 * select "id", (
 *   select coalesce((select * from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     order by "pet"."name"
 *     offset 0 rows
 *   ) as "agg" for json path, include_null_values), '[]')
 * ) as "pets"
 * from "person"
 * ```
 * 
 * @template O
 * @param {import("kysely").Expression<O>} expr 
 * @returns {import("kysely").RawBuilder<import("kysely").Simplify<O>[]>}
 */
export function mssql_stringArrayFrom(expr) {
  return sql`coalesce((select * from ${expr} as agg for json path, include_null_values), '[]')`
}


/**
 * An MS SQL Server helper for turning a subquery into a JSON object.
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
 *   dialect: new MssqlDialect(config),
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
 *         .where('pet.is_favorite', '=', 1)
 *     ).as('favorite_pet')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].favorite_pet.pet_id
 * result[0].favorite_pet.name
 * ```
 *
 * The generated SQL (MS SQL Server):
 *
 * ```sql
 * select "id", (
 *   select * from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     and "pet"."is_favorite" = @1
 *   ) as "agg" for json path, include_null_values, without_array_wrapper
 * ) as "favorite_pet"
 * from "person"
 * ```
 * 
 * @template O
 * @param {import("kysely").Expression<O>} expr 
 * @returns {import("kysely").RawBuilder<import("kysely").Simplify<O> | null>}
 */
export function mssql_jsonObjectFrom(expr) {
  return sql`(select * from ${expr} as agg for json path, include_null_values, without_array_wrapper)`
}

/**
 * The MS SQL Server `json_query` function, single argument variant.
 *
 * NOTE: This helper only works correctly if you've installed the `ParseJSONResultsPlugin`.
 * Otherwise the nested selections will be returned as JSON strings.
 *
 * The plugin can be installed like this:
 *
 * ```ts
 * const db = new Kysely({
 *   dialect: new MssqlDialect(config),
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
 *       full: eb.fn('concat', ['first_name', eb.val(' '), 'last_name'])
 *     }).as('name')
 *   ])
 *   .execute()
 * ```
 *
 * The generated SQL (MS SQL Server):
 *
 * ```sql
 * select "id", json_query(
 *   '{"first":"'+"first_name"+',"last":"'+"last_name"+',"full":"'+concat("first_name", ' ', "last_name")+'"}'
 * ) as "name"
 * from "person"
 * ```
 * 
 * @template {Record<string, import("kysely").Expression<unknown>>} O
 * @param {O} obj 
 * @returns {import("kysely").RawBuilder<import("kysely").Simplify<{[K in keyof O]: O[K] extends Expression<infer V> ? V : never}>>}
 */
export function mssql_jsonBuildObject(obj) {
  return sql`json_query('{${sql.join(
    Object.keys(obj).map((k) => sql`"${sql.raw(k)}":"'+${obj[k]}+'"`),
    sql`,`,
  )}}')`
}