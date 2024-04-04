import { ExpressionWrapper, InsertQueryBuilder, Transaction } from 'kysely'
import { jsonArrayFrom, stringArrayFrom } from './con.helpers.json.js'

/**
 * 
 * @param {string} id_or_handle
 */
export const where_id_or_handle_entity = (id_or_handle) => {
  /**
   * @param {import('kysely').ExpressionBuilder<Database>} eb 
   */
  return (eb) => eb.or(
    [
      eb('entity_handle', '=', id_or_handle),
      eb('entity_id', '=', id_or_handle),
    ]
  );
}

/**
 * 
 * @param {string} id_or_handle
 */
export const where_id_or_handle_table = (id_or_handle) => {
  /**
   * @param {import('kysely').ExpressionBuilder<Database>} eb 
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
 * | 'storefronts_to_other'>
 * } EntityTableKeys
 */

/**
 * helper to generate entity values delete
 * @param {EntityTableKeys} entity_table_name 
 */
export const delete_entity_values_by_value_or_reporter = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<Database>} trx 
   * @param {string} value delete by entity value
   * @param {string} [reporter] delete by reporter
   */
  return (trx, value, reporter=undefined) => {

    return trx.deleteFrom(entity_table_name).where(
      eb => eb.or(
        [
          value && eb('value', '=', value),
          reporter && eb('reporter', '=', reporter),
        ].filter(Boolean)
      )
    ).executeTakeFirst();
  }
}

/**
 * helper to generate entity values delete
 * @param {EntityTableKeys} entity_table_name 
 */
export const delete_entity_values_of_by_entity_id_or_handle = 
(entity_table_name) => {
  /**
   * 
   * @param {Transaction<import('../index.js').Database>} trx 
   * @param {string} entity_id delete by id
   * @param {string} [entity_handle=entity_id] delete by handle
   */
  return (trx, entity_id, entity_handle=undefined) => {
    return trx.deleteFrom(entity_table_name).where(
      eb => eb.or(
        [
          eb('entity_id', '=', entity_id),
          eb('entity_handle', '=', entity_handle ?? entity_id),
        ]
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
   * @param {Transaction<Database>} trx 
   * @param {string[]} values values of the entity
   * @param {string} item_id whom the tags belong to
   * @param {string} [item_handle] whom the tags belong to
   * @param {boolean} [delete_previous=true] if true and `reporter`, then will delete by reporter, otherwise by `item_id/item_handle`
   * @param {string} [reporter=undefined] the reporter of the batch values (another segment technique)
   * @param {string} [context=undefined] the context (another segment technique)
   */
  return async (trx, values, item_id, item_handle, delete_previous=true, 
    reporter=undefined, context=undefined) => {

    if(delete_previous) {
      if(reporter) {
        await delete_entity_values_by_value_or_reporter(entity_table_name)(
          trx, undefined, reporter
          );
      } else {
        await delete_entity_values_of_by_entity_id_or_handle(entity_table_name)(
          trx, item_id, item_handle
          );
      }
    }

    if(!values?.length) return Promise.resolve();

    return await trx.insertInto(entity_table_name).values(
      values.map(t => ({
          entity_handle: item_handle,
          entity_id: item_id,
          value: t,
          reporter,
          context
        })
      )
    ).executeTakeFirst();
  }
}

/**
 * helper to generate entity values delete
 * @param {EntityTableKeys} entity_table_name 
 */
export const insert_entity_values_of = (entity_table_name) => {
  /**
   * 
   * @param {Transaction<Database>} trx 
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
 * @param {EntityTableKeys} entity_table 
 */
export const insert_entity_array_values_with_delete_of = (entity_table) => {
/**
 * @param {Transaction<Database>} trx 
 * @param {string[]} values values of the entity
 * @param {string} item_id entity id
 * @param {string} [item_handle] entity handle
 * @param {string} [context] context
 */
return (trx, values, item_id, item_handle, context) => {
    return insert_entity_array_values_of(entity_table)(
      trx, values, item_id, item_handle, true, undefined, context
    )
  };
}

export const insert_tags_of = insert_entity_array_values_with_delete_of('entity_to_tags_projections');
export const insert_search_of = insert_entity_array_values_with_delete_of('entity_to_search_terms');
export const insert_media_of = insert_entity_array_values_with_delete_of('entity_to_media');

export const delete_tags_of = delete_entity_values_of_by_entity_id_or_handle('entity_to_tags_projections');
export const delete_search_of = delete_entity_values_of_by_entity_id_or_handle('entity_to_search_terms');
export const delete_media_of = delete_entity_values_of_by_entity_id_or_handle('entity_to_media');

/**
 * @typedef {import('../index.js').Database} Database
 */

/**
 * @template {keyof Database} T
 * @param {Transaction<Database>} trx 
 * @param {T} table_name 
 * @param {Parameters<InsertQueryBuilder<Database, T>["values"]>[0]} item values of the entity
 */
export const regular_upsert_me = async (trx, table_name, item) => {
// export const regular_upsert_me = async (trx, table_name, item_id, item) => {
  await trx.deleteFrom(table_name).where(
    eb => eb.or(
      [
        item.id && eb('id', '=', item.id),
        item.handle && eb('handle', '=', item.handle),
      ].filter(Boolean)
    )
  ).execute();
  return await trx.insertInto(table_name).values(item).executeTakeFirst()
}


/**
 * 
 * @param {Transaction<Database>} trx 
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const with_media = (eb, id_or_handle, sql_type) => {
  return stringArrayFrom(
    select_values_of_entity_by_entity_id_or_handle(
      eb, 'entity_to_media', id_or_handle
    ), sql_type
  ).as('media');
}

/**
 * helper to select base attributes
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {keyof Database} table 
 * @return {import('kysely').SelectQueryBuilder<Database, table>}
 */
const select_base_from = (eb, table) => {
  return [ 
    'active', 'attributes', 'created_at', 'updated_at',
    'description', 'handle', 'id'
  ].map(k => `${table}.${k}`).reduce(
    (p, c) => p.select(c), eb.selectFrom(table)
  );
}

/**
 * select as json array collections of a product
 * @param {import('kysely').ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const products_with_collections = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'collections')
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
 * @param {import('kysely').ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const products_with_discounts = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'discounts')
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
 * @param {import('kysely').ExpressionBuilder<Database, 'products'>} eb 
 * @param {string | ExpressionWrapper<Database>} product_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const products_with_variants = (eb, product_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'products')
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
 * @param {import('kysely').ExpressionBuilder<Database, 'storefronts'>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const storefront_with_collections = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'collections')
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const storefront_with_products = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'products')
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const storefront_with_discounts = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'discounts')
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const storefront_with_posts = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'posts')
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {string | ExpressionWrapper<Database>} sf_id_or_handle 
 * @param {import('../types.public.js').SqlDialectType} sql_type 
 */
export const storefront_with_shipping = (eb, sf_id_or_handle, sql_type) => {
  return jsonArrayFrom(
    select_base_from(eb, 'shipping_methods')
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
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
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

/**
 * select the entity ids which are constrained by value or reporter
 * @param {import('kysely').ExpressionBuilder<Database>} eb 
 * @param {EntityTableKeys} entity_junction_table 
 * @param {string | ExpressionWrapper<Database>} value 
 * @param {string | ExpressionWrapper<Database>} [reporter] 
 */
export const select_entity_ids_by_value_or_reporter = 
(eb, entity_junction_table, value, reporter=undefined) => {
  return eb
    .selectFrom(entity_junction_table)
    .select(`${entity_junction_table}.entity_id`)
    .where(eb2 => eb2.or(
      [
        eb2(`${entity_junction_table}.value`, '=', value ?? reporter),
        eb2(`${entity_junction_table}.reporter`, '=', reporter ?? value),
      ]
      )
    )
    .orderBy(`${entity_junction_table}.entity_id`);
}
