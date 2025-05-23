/**
 * @import { db_crud } from '@storecraft/core/database'
 * @import { Database } from '../types.sql.tables.js'
 * @import { ExpressionBuilder, InsertObject } from 'kysely'
 * @import { SqlDialectType } from '../types.public.js'
 * @import { QueryableTables } from './utils.types.js'
 */
import { ExpressionWrapper, InsertQueryBuilder, Kysely, Transaction } from 'kysely'
import { jsonArrayFrom, stringArrayFrom } from './con.helpers.json.js'
import { SQL } from '../index.js';
import { query_to_eb } from './utils.query.js';

/**
 * @template K
 * @typedef {K extends Kysely<infer D> ? D : unknown} KDB
 * 
 */

/**
 * @description Use the current kysely connection as transaction if
 * it already a transaction, otherwise eecute a new transaction.
 * 
 * @param {Kysely<Database>} k 
 * 
 */
export const safe_trx = (k) => {
  if(k.isTransaction) {
    return {
      /**
       * 
       * @param {(k: Kysely<Database>) => Promise<any>} cb 
       */
      execute: (cb) => {
        return cb(k);
      }
    }
  }

  return {
    /**
     * @param {(k: Transaction<Database>) => Promise<any>} cb 
     */
    execute: (cb) => k.transaction().execute(cb)
  }
}


/**
 * @template {keyof Database} [T=(keyof Database)]  
 * @param {SQL} driver 
 * @param {T} table_name 
 * @returns {db_crud["count"]}
 */
export const count_regular = (driver, table_name) => {
  return async (query) => {

    const result = await driver.client
    .selectFrom(table_name)
    .select(
      (eb) => eb.fn.countAll().as('count')
    )
    .where(
      (eb) => {
        return query_to_eb(eb, query, table_name);
      }
    )
    .executeTakeFirst();

    return Number(result.count);
  }
}

/**
 * @param {string} id_or_handle
 */
export const where_id_or_handle_entity = (id_or_handle) => {
  /**
   * @param {ExpressionBuilder<Database>} eb 
   */
  return (eb) => eb.or(
    [
      eb('entity_handle', '=', id_or_handle),
      eb('entity_id', '=', id_or_handle),
    ]
  );
}

/**
 * @param {string} id_or_handle
 */
export const where_id_or_handle_table = (id_or_handle) => {
  /**
   * @param {ExpressionBuilder<Database>} eb 
   */
  return (eb) => eb.or(
    [
      eb('id', '=', id_or_handle),
      eb('handle', '=', id_or_handle),
    ]
  );
}

/**
 * @typedef { keyof Pick<Database, 
 * 'entity_to_media' | 'entity_to_search_terms' 
 * | 'entity_to_tags_projections' | 'products_to_collections' 
 * | 'products_to_discounts' | 'products_to_variants' 
 * | 'products_to_related_products' | 'storefronts_to_other'>
 * } EntityTableKeys
 */

/**
 * helper to delete entity values from conjunction table.
 * 
 * Usually in entity tables, the (`value`, `reporter`) pair maps to 
 * (`secondary_entity_id`, `secondary_entity_handle`).
 * 
 * 1. This is true for all entity tables except of `entity_to_tags_projections`, 
 * `entity_to_search_terms`, `entity_to_media`.
 * 2. In those other entity tables, usually:
 *  - `value` identifies an entity
 *  - `reporter` handle identifies an entity in tables `products_to_collections`, 
 * `products_to_discounts`, `products_to_variants`, `products_to_related_products`
 *  - `reporter` does not identify an entity in `storefronts_to_other` because it 
 * hosts many resource types (for example, a post has the same handle as a product)
 *    - `reporter` + `context` identifies a secondary identity in `storefronts_to_other`
 * 
 * Please consult the full documentation about interpretation of the entity 
 * tables in `../types.sql.tables.jd.ts`.
 * 
 * Consult {@link '../types.sql.tables.jd.ts'} for the list of meaningful entity tables
 * and their interpretations. and take a look at the database, it is actually
 * quite simple
 * 
 * @param {EntityTableKeys} entity_table_name 
 */
export const delete_entity_values_by_value_or_reporter_and_context = (
  entity_table_name
) => {
  /**
   * 
   * @param {Kysely<Database>} trx 
   * @param {string} value delete by entity value
   * @param {string} [reporter] delete by reporter
   * @param {string} [context] delete by reporter + context
   */
  return (trx, value, reporter, context) => {

    return trx
    .deleteFrom(entity_table_name)
    .where(
      eb => eb.or(
        [
          value && eb('value', '=', value),
          reporter && context && eb.and(
            [
              eb('reporter', '=', reporter),
              eb('context', '=', context),
            ]
          ),
          reporter && !(context) && eb('reporter', '=', reporter),
        ].filter(Boolean)
      )
    ).executeTakeFirst();
  }
}


/**
 * helper to delete entity values
 * 
 * 1. either by `entity_id` which always identifies an entity.
 * 2. or by `entity_handle` which identifies an entity for some entity tables 
 * such as `products_to_collections`, `products_to_discounts`, `products_to_variants`, 
 * `products_to_related_products`, `storefronts_to_other`
 * 3. or by `entity_handle` + `context` which identifies an entity for some entity tables 
 * such as `entity_to_tags_projections`, `entity_to_search_terms`, `entity_to_media`
 * 
 * - `entity_handle` by itself does not always identify an entity, 
 * but `entity_handle` + `context` does.
 * 
 * for example, we may have a product and a collection with the same `entity_handle` 
 * in the `entity_to_tags_projections` table, but they are different entities. 
 * Therefore, if we naively delete by `entity_handle`, we may delete more entities than intended.
 * 
 * @param {EntityTableKeys} entity_table_name 
 */
export const delete_entity_values_of_by_entity_id_or_handle_and_context = (
  entity_table_name
) => {
  /**
   * 
   * @param {Kysely<Database>} trx 
   * @param {string} entity_id delete by id
   * @param {string} [entity_handle] delete by handle
   * @param {string} [context=undefined] the context (another segment technique)
   */
  return (trx, entity_id, entity_handle=undefined, context=undefined) => {
    return trx
    .deleteFrom(entity_table_name)
    .where(
      eb => eb.or(
        [
          entity_id && eb('entity_id', '=', entity_id),
          entity_handle && context && eb.and(
            [
              eb('entity_handle', '=', entity_handle),
              eb('context', '=', context)
            ]
          ),
          entity_handle && !(context) && eb('entity_handle', '=', entity_handle),
        ].filter(Boolean)
      )
    ).executeTakeFirst();
  }
}

/**
 * helper to generate entity values for simple tables
 * @param {EntityTableKeys} entity_table_name 
 */
export const insert_entity_array_values_of = (entity_table_name) => {
  /**
   * 
   * @param {Kysely<Database>} trx 
   * @param {string[]} values values of the entity
   * @param {string} item_id whom the tags belong to
   * @param {string} [item_handle] whom the tags belong to
   * @param {boolean} [delete_previous=true] if true and `reporter`, 
   * then will delete by reporter, otherwise by `item_id/item_handle`
   * @param {string} [context=undefined] the context (another segment technique)
   */
  return async (
    trx, values, item_id, item_handle, 
    delete_previous=true, 
    context=undefined
  ) => {

    if(delete_previous) {
      await delete_entity_values_of_by_entity_id_or_handle_and_context(entity_table_name)(
        trx, item_id, item_handle, context
      );
    }

    if(!values?.length) return Promise.resolve();

    return await trx.insertInto(entity_table_name).values(
      values.map(t => ({
          entity_handle: item_handle,
          entity_id: item_id,
          value: t,
          context
        })
      )
    ).executeTakeFirst();
  }
}

/**
 * helper to generate entity values delete
 * 
 * @param {EntityTableKeys} entity_table_name 
 */
export const insert_entity_values_of = (entity_table_name) => {
  /**
   * 
   * @param {Kysely<Database>} trx 
   * @param {{value: string, reporter: string}[]} values values of the entity
   * @param {string} item_id whom the tags belong to
   * @param {string} [item_handle] whom the tags belong to
   * @param {string} [context=undefined] the context (another segment technique)
   */
  return async (trx, values, item_id, item_handle, context=undefined) => {

    if(!values?.length) return Promise.resolve();

    return await trx.insertInto(entity_table_name).values(
      values.map(t => ({
          entity_id: item_id,
          entity_handle: item_handle,
          value: t.value,
          reporter: t.reporter,
          context
        })
      )
    ).executeTakeFirst();
  }
}


/**
 * Delete previous entities by `id/handle` and insert new ones
 * 
 * @param {EntityTableKeys} entity_table 
 */
export const insert_entity_array_values_with_delete_of = (entity_table) => {
/**
 * @param {Kysely<Database>} trx 
 * @param {string[]} values values of the entity
 * @param {string} item_id entity id
 * @param {string} [item_handle] entity handle
 * @param {string} [context] context
 */
return (trx, values, item_id, item_handle, context) => {
    return insert_entity_array_values_of(entity_table)(
      trx, values, item_id, item_handle, true, context
    )
  };
}

export const insert_tags_of = insert_entity_array_values_with_delete_of('entity_to_tags_projections');
export const insert_search_of = insert_entity_array_values_with_delete_of('entity_to_search_terms');
export const insert_media_of = insert_entity_array_values_with_delete_of('entity_to_media');

export const delete_tags_of = delete_entity_values_of_by_entity_id_or_handle_and_context('entity_to_tags_projections');
export const delete_search_of = delete_entity_values_of_by_entity_id_or_handle_and_context('entity_to_search_terms');
export const delete_media_of = delete_entity_values_of_by_entity_id_or_handle_and_context('entity_to_media');


/**
 * @template {keyof Database} [T=(keyof Database)]
 * @param {Kysely<Database>} trx 
 * @param {T} table_name 
 * @param {InsertObject<Database, T> & {id: string, handle: string}} item values of the entity
 */
export const regular_upsert_me = async (trx, table_name, item) => {

  // TODO: maybe use only `id`
  await trx
  .deleteFrom(table_name)
  .where(
    (eb) => eb.or(
      [
        // @ts-ignore
        item?.id && eb('id', '=', item.id),
        // @ts-ignore
        item?.handle && eb('handle', '=', item.handle),
      ].filter(Boolean)
    )
  ).execute();

  return await trx
  .insertInto(table_name)
  .values(item)
  .executeTakeFirst()
}


/**
 * 
 * @param {Kysely<Database>} trx 
 * @param {keyof Database} table_name 
 * @param {string} id_or_handle 
 */
export const delete_me = async (trx, table_name, id_or_handle) => {
  // console.log('delete ', id_or_handle)
  return await trx.deleteFrom(table_name).where(
    where_id_or_handle_table(id_or_handle)
  ).executeTakeFirst();
}

/**
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const with_tags = (eb, id_or_handle, sql_type) => {
  return stringArrayFrom(
    select_values_of_entity_by_entity_id_or_handle(
      eb, 'entity_to_tags_projections', id_or_handle
    ), sql_type
  ).as('tags');
}

/**
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const with_search = (eb, id_or_handle, sql_type) => {
  return stringArrayFrom(
    select_values_of_entity_by_entity_id_or_handle(
      eb, 'entity_to_search_terms', id_or_handle
    ), sql_type
  ).as('search');
}

/**
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const with_media = (eb, id_or_handle, sql_type) => {
  return stringArrayFrom(
    select_values_of_entity_by_entity_id_or_handle(
      eb, 'entity_to_media', id_or_handle
    ), sql_type
  ).as('media');
}


/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const products_with_collections = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('collections')
      .select('collections.active')
      .select('collections.attributes')
      .select('collections.created_at')
      .select('collections.updated_at')
      .select('collections.description')
      .select('collections.handle')
      .select('collections.id')
      .select('collections.title')
      .select('collections.published')
      .select(eb => [
        with_tags(eb, eb.ref('collections.id'), sql_type),
        with_media(eb, eb.ref('collections.id'), sql_type),
      ])
      .where('collections.id', 'in', 
        eb => select_values_of_entity_by_entity_id_or_handle(
          eb, 'products_to_collections', product_id_or_handle
        )
      ), sql_type
    ).as('collections');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const products_with_discounts = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('discounts')
      .select('discounts.active')
      .select('discounts.attributes')
      .select('discounts.created_at')
      .select('discounts.updated_at')
      .select('discounts.description')
      .select('discounts.handle')
      .select('discounts.id')
      .select('discounts.title')
      .select('discounts.published')
      .select('discounts.application')
      .select('discounts.info')
      .select('discounts.priority')
      .select(eb => [
        with_tags(eb, eb.ref('discounts.id'), sql_type),
        with_media(eb, eb.ref('discounts.id'), sql_type),
      ])
      .where('discounts.id', 'in', 
        eb => select_values_of_entity_by_entity_id_or_handle(
          eb, 'products_to_discounts', product_id_or_handle
        )
      ), sql_type
    ).as('discounts');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const products_with_variants = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('products')
      .select('products.active')
      .select('products.attributes')
      .select('products.created_at')
      .select('products.updated_at')
      .select('products.description')
      .select('products.handle')
      .select('products.id')
      .select('products.compare_at_price')
      .select('products.parent_handle')
      .select('products.parent_id')
      .select('products.price')
      .select('products.qty')
      .select('products.title')
      .select('products.variant_hint')
      .select('products.variants_options')
      .select('products.video')
      .select(eb => [
        with_tags(eb, eb.ref('products.id'), sql_type),
        with_media(eb, eb.ref('products.id'), sql_type),
      ])
      .where('products.id', 'in', 
        eb => select_values_of_entity_by_entity_id_or_handle(
          eb, 'products_to_variants', product_id_or_handle
        )
      ), sql_type
    ).as('variants');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const products_with_related_products = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('products')
      .select('products.active')
      .select('products.attributes')
      .select('products.created_at')
      .select('products.updated_at')
      .select('products.description')
      .select('products.handle')
      .select('products.id')
      .select('products.compare_at_price')
      .select('products.parent_handle')
      .select('products.parent_id')
      .select('products.price')
      .select('products.qty')
      .select('products.title')
      .select('products.variant_hint')
      .select('products.variants_options')
      .select('products.video')
      .select(eb => [
        with_tags(eb, eb.ref('products.id'), sql_type),
        with_media(eb, eb.ref('products.id'), sql_type),
      ])
      .where('products.id', 'in', 
        eb => select_values_of_entity_by_entity_id_or_handle(
          eb, 'products_to_related_products', product_id_or_handle
        )
      ), sql_type
    ).as('related_products');
}


/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database, 'storefronts'>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const storefront_with_collections = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('collections')
      .select('collections.active')
      .select('collections.attributes')
      .select('collections.created_at')
      .select('collections.updated_at')
      .select('collections.description')
      .select('collections.handle')
      .select('collections.id')
      .select('collections.title')
      .select('collections.published')
      .select(eb => [
      with_tags(eb, eb.ref('collections.id'), sql_type),
      with_media(eb, eb.ref('collections.id'), sql_type),
    ])
    .where('collections.id', 'in', 
      eb => select_values_of_entity_by_entity_id_or_handle(
        eb, 'storefronts_to_other', sf_id_or_handle
      )
    ), sql_type
  ).as('collections');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const storefront_with_products = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('products')
    .select('products.active')
    .select('products.attributes')
    .select('products.created_at')
    .select('products.updated_at')
    .select('products.description')
    .select('products.handle')
    .select('products.id')
    .select('products.title')
    .select('products.compare_at_price')
    .select('products.parent_handle')
    .select('products.parent_id')
    .select('products.price')
    .select('products.qty')
    .select('products.variant_hint')
    .select('products.variants_options')
    .select('products.video')
    .select(eb => [
      with_tags(eb, eb.ref('products.id'), sql_type),
      with_media(eb, eb.ref('products.id'), sql_type),
    ])
    .where('products.id', 'in', 
      eb => select_values_of_entity_by_entity_id_or_handle(
        eb, 'storefronts_to_other', sf_id_or_handle
      )
    ), sql_type
  ).as('products');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const storefront_with_discounts = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('discounts')
    .select('discounts.active')
    .select('discounts.attributes')
    .select('discounts.created_at')
    .select('discounts.updated_at')
    .select('discounts.description')
    .select('discounts.handle')
    .select('discounts.id')
    .select('discounts.application')
    .select('discounts.info')
    .select('discounts.priority')
    .select('discounts.published')
    .select('discounts.title')
    .select(eb => [
      with_tags(eb, eb.ref('discounts.id'), sql_type),
      with_media(eb, eb.ref('discounts.id'), sql_type),
    ])
    .where('discounts.id', 'in', 
      eb => select_values_of_entity_by_entity_id_or_handle(
        eb, 'storefronts_to_other', sf_id_or_handle
      )
    ), sql_type
  ).as('discounts');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const storefront_with_posts = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('posts')
    .select('posts.active')
    .select('posts.attributes')
    .select('posts.created_at')
    .select('posts.updated_at')
    .select('posts.description')
    .select('posts.handle')
    .select('posts.id')
    .select('posts.text')
    .select('posts.title')
    .select(eb => [
      with_tags(eb, eb.ref('posts.id'), sql_type),
      with_media(eb, eb.ref('posts.id'), sql_type),
    ])
    .where('posts.id', 'in', 
      eb => select_values_of_entity_by_entity_id_or_handle(
        eb, 'storefronts_to_other', sf_id_or_handle
      )
    ), sql_type
  ).as('posts');
}

/**
 * select as json array collections of a product
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {SqlDialectType} sql_type 
 */
export const storefront_with_shipping = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    eb.selectFrom('shipping_methods')
    .select('shipping_methods.active')
    .select('shipping_methods.attributes')
    .select('shipping_methods.created_at')
    .select('shipping_methods.updated_at')
    .select('shipping_methods.description')
    .select('shipping_methods.handle')
    .select('shipping_methods.id')
    .select('shipping_methods.price')
    .select('shipping_methods.title')
    .select(eb => [
      with_tags(eb, eb.ref('shipping_methods.id'), sql_type),
      with_media(eb, eb.ref('shipping_methods.id'), sql_type),
    ])
    .where('shipping_methods.id', 'in', 
      eb => select_values_of_entity_by_entity_id_or_handle(
        eb, 'storefronts_to_other', sf_id_or_handle
      )
    ), sql_type
  ).as('shipping_methods');
}

/**
 * select all the entity values by entity id or handle
 * 
 * @param {ExpressionBuilder<Database>} eb 
 * @param {EntityTableKeys} entity_junction_table 
 * @param {string | ExpressionWrapper<Database>} entity_id_or_handle 
 */
export const select_values_of_entity_by_entity_id_or_handle = 
(eb, entity_junction_table, entity_id_or_handle) => {
  return eb
  .selectFrom(entity_junction_table)
  .select(`${entity_junction_table}.value`)
  .where(eb2 => eb2.or(
    [
      eb2(`${entity_junction_table}.entity_id`, '=', entity_id_or_handle),
      eb2(`${entity_junction_table}.entity_handle`, '=', entity_id_or_handle),
    ]
    )
  )
  .orderBy(`${entity_junction_table}.id`);
}
