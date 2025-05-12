/**
 * @import { ProductType, VariantType } from '@storecraft/core/api'
 * @import { db_products as db_col, RegularGetOptions } from '@storecraft/core/database'
 * @import { Database } from '../types.sql.tables.js'
 */

import { enums } from '@storecraft/core/api'
import { SQL } from '../index.js'
import { 
  delete_entity_values_of_by_entity_id_or_handle_and_context, 
  delete_me, delete_media_of, 
  delete_search_of, delete_tags_of, 
  insert_entity_values_of, insert_media_of, insert_search_of, 
  insert_tags_of, regular_upsert_me, 
  where_id_or_handle_table, products_with_collections, 
  with_tags, with_media, 
  delete_entity_values_by_value_or_reporter_and_context,
  products_with_discounts,
  products_with_variants,
  count_regular,
  products_with_related_products,
  with_search} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { withQuery } from './utils.query.js'
import { Transaction } from 'kysely'
import { report_document_media } from './con.images.js'
import { union } from '@storecraft/core/api/utils.func.js'
import { 
  helper_compute_product_extra_tags_because_of_discount_side_effect_for_db,
  helper_compute_product_extra_search_keywords_because_of_discount_side_effect_for_db
 } from '@storecraft/core/database'


export const table_name = 'products'

/**
 * @param {db_col["$type_upsert"]} item 
 */
const is_variant = item => {
  if(
    item && 
    ('variant_hint' in item) && 
    ('parent_handle' in item) && 
    ('parent_id' in item)
  ) {
    return item.parent_handle && 
      item.parent_id && 
      item.variant_hint;
  }

  return false;
}

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item, search_terms) => {
    const c = driver.client;
    
    try {
      // The product has changed, it's discounts eligibility may have changed.
      // get all automatic + active discounts
      const discounts = await driver.client
      .selectFrom('discounts')
      .selectAll()
      .where(
        eb => eb.and(
          [
            eb('active', '=', 1),
            eb('_application_id', '=', enums.DiscountApplicationEnum.Auto.id),
          ]
        )
      ).execute();

      const eligible_discounts = discounts.filter(
        d => driver.app.api.pricing.test_product_filters_against_product(
          d.info.filters, item
        )
      );

      
      
      item.tags = union(
        [
          // remove old discount tags
          item.tags?.filter(t => !t.startsWith('discount_')),
          // add new discount tags
          eligible_discounts.map(
            helper_compute_product_extra_tags_because_of_discount_side_effect_for_db
          ),
        ]
      );

      search_terms = union(
        [
          search_terms, 
          eligible_discounts.map(
            helper_compute_product_extra_search_keywords_because_of_discount_side_effect_for_db
          ),
        ]
      );

      const t = await driver.client.transaction().execute(
        async (trx) => {

          // entities
          await insert_tags_of(trx, item.tags, item.id, item.handle, table_name);
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await insert_media_of(trx, item.media, item.id, item.handle, table_name);
          await report_document_media(driver)(item, trx);
          // main
          await regular_upsert_me(trx, table_name, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            isbn: item.isbn,
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            title: item.title,
            compare_at_price: item.compare_at_price,
            price: item.price,
            video: item.video,
            qty: item.qty,
            variants_options: 'variants_options' in item ? JSON.stringify(item.variants_options) : undefined,
            // no variants yet
            parent_handle: ('parent_handle' in item) ? item.parent_handle : undefined,
            parent_id: ('parent_id' in item) ? item.parent_id : undefined,
            variant_hint: ('variant_hint' in item) ? JSON.stringify(item.variant_hint) : undefined,
          });

          // PRODUCTS => VARIANTS
          if(item && ('variant_hint' in item) && is_variant(item)) {
            // remove previous
            await delete_entity_values_by_value_or_reporter_and_context('products_to_variants')(
              trx, item.id, item.handle
            );
            // add 
            await insert_entity_values_of('products_to_variants')(
              trx, [{ value: item.id, reporter: item.handle }], 
              item.parent_id, item.parent_handle, 
            );
          }

          //
          // Explicit PRODUCTS => COLLECTIONS
          //
          // remove this product's old collections connections
          await delete_entity_values_of_by_entity_id_or_handle_and_context('products_to_collections')(
            trx, item.id
          );
          if(item.collections) {
            // add this product's new collections connections
            await insert_entity_values_of('products_to_collections')(
              trx, item.collections.map(c => ({ value: c.id, reporter: c.handle })), 
              item.id, item.handle, 
            );
          }

          //
          // Explicit PRODUCTS => Related Products
          //
          // remove this product's old collections connections
          await delete_entity_values_of_by_entity_id_or_handle_and_context('products_to_related_products')(
            trx, item.id
          );
          if(item.related_products) {
            // add this product's new `related_products` connections
            await insert_entity_values_of('products_to_related_products')(
              trx, 
              item.related_products.map(c => ({ value: c.id, reporter: c.handle })), 
              item.id, item.handle, 
            );
          }

          // PRODUCTS => DISCOUNTS
          // remove this product's older connections to discounts
          await delete_entity_values_of_by_entity_id_or_handle_and_context('products_to_discounts')(
            trx, item.id
          );
          if(eligible_discounts) {
            // insert new connections to discounts
            await insert_entity_values_of('products_to_discounts')(
              trx, eligible_discounts.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 
            );
          }
        }
      );
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}


/**
 * @param {SQL} driver 
 * 
 * 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  // @ts-ignore
  return (id_or_handle, options) => {

    const expand = options?.expand ?? ['*'];
    const expand_collections = expand.includes('*') || expand.includes('collections');
    const expand_discounts = expand.includes('*') || expand.includes('discounts');
    const expand_variants = expand.includes('*') || 
      (/** @type {RegularGetOptions<ProductType>["expand"]} */(expand)).includes('variants');
    const expand_related_products = expand.includes('*') || expand.includes('related_products');
    const dtype = driver.config.dialect_type;

    return driver.client
    .selectFrom(table_name)
    .selectAll('products')
    .select(
      eb => [
        with_tags(eb, id_or_handle, dtype),
        with_media(eb, id_or_handle, dtype),
        expand_collections && products_with_collections(eb, id_or_handle, dtype),
        expand_discounts && products_with_discounts(eb, id_or_handle, dtype),
        expand_variants && products_with_variants(eb, id_or_handle, dtype),
        expand_related_products && products_with_related_products(eb, id_or_handle, dtype),
        with_search(eb, id_or_handle, dtype)
      ].filter(Boolean)
    )
    .where(where_id_or_handle_table(id_or_handle))
    // .compile()
    .executeTakeFirst()
    .then(sanitize);
  }
}

/**
 * @param {SQL} driver 
 * 
 * 
 * @returns {db_col["getBulk"]}
 */
const getBulk = (driver) => {
  // @ts-ignore
  return async (ids, options) => {

    const expand = options?.expand ?? ['*'];
    const expand_collections = expand.includes('*') || expand.includes('collections');
    const expand_discounts = expand.includes('*') || expand.includes('discounts');
    const expand_variants = expand.includes('*') || 
      (/** @type {RegularGetOptions<ProductType>["expand"]} */(expand)).includes('variants');
    const expand_related_products = expand.includes('*') || expand.includes('related_products');
    const dtype = driver.config.dialect_type;

    const r = await driver.client
    .selectFrom(table_name)
    .selectAll('products')
    .select(
      eb => [
        with_tags(eb, eb.ref('products.id'), dtype),
        with_media(eb, eb.ref('products.id'), dtype),
        expand_collections && products_with_collections(eb, eb.ref('products.id'), dtype),
        expand_discounts && products_with_discounts(eb, eb.ref('products.id'), dtype),
        expand_variants && products_with_variants(eb, eb.ref('products.id'), dtype),
        expand_related_products && products_with_related_products(eb, eb.ref('products.id'), dtype),
        with_search(eb, eb.ref('products.id'), dtype)
      ].filter(Boolean)
    )
    .where(
      (eb) => eb.or(
        [
          eb('id', 'in', ids),
          eb('handle', 'in', ids),
        ]
      )
    )
    // .compile()
    .execute()
    .then(sanitize_array);

    return ids.map(
      id => r.find(s => s.id===id || s?.handle===id)
    );
  }
}


/**
 * @param {SQL} driver 
 */
const remove_internal = (driver) => {
  /**
   * @param {ProductType | VariantType} product
   * @param {Transaction<Database>} trx
   */
  return async (product, trx) => {
    // entities
    await delete_tags_of(trx, product.id);
    await delete_search_of(trx, product.id);
    await delete_media_of(trx, product.id);
    // PRODUCTS => COLLECTIONS
    await delete_entity_values_of_by_entity_id_or_handle_and_context('products_to_collections')(
      trx, product.id
    );
    // PRODUCTS => DISCOUNTS
    await delete_entity_values_of_by_entity_id_or_handle_and_context('products_to_discounts')(
      trx, product.id
    );
    // STOREFRONT => PRODUCT
    // TODO: this is problematic
    await delete_entity_values_by_value_or_reporter_and_context('storefronts_to_other')(
      trx, product.id, product.handle, table_name
    );
    // PRODUCTS => RELATED PRODUCT
    await delete_entity_values_by_value_or_reporter_and_context('products_to_related_products')(
      trx, product.id, product.handle
    );
    // PRODUCT => VARIANTS
    // delete all of it's variants
    {
      if(is_variant(product)) {
        // delete my reported connections
        await delete_entity_values_by_value_or_reporter_and_context('products_to_variants')(
          trx, product.id, product.handle
        );
      } else if(product && 'variants' in product) { // parent
        await Promise.all(
          (product.variants ?? []).map(v => remove_internal(driver)(v, trx))
        );
        // if I am a parent product, delete my relations to all previous variants
        await delete_entity_values_of_by_entity_id_or_handle_and_context('products_to_variants')(
          trx, product.id
        );
      }
    }

    // delete me
    await delete_me(trx, table_name, product.id);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    try {
      const product = await get(driver)(id_or_handle, { expand: ['variants'] });

      if(!product)
        return true;

      await driver.client.transaction().execute(
        async (trx) => {
          await remove_internal(driver)(product, trx);
        }
      );

    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}

/**
 * @param {SQL} driver 
 * 
 * 
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  // @ts-ignore
  return async (query) => {

    const expand = query.expand ?? ['*'];
    const expand_collections = expand.includes('*') || expand.includes('collections');
    const expand_discounts = expand.includes('*') || expand.includes('discounts');
    // @ts-ignore
    const expand_variants = expand.includes('*') || expand.includes('variants');
    const expand_related_products = expand.includes('*') || expand.includes('related_products');

    const items = await withQuery(
      driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(
        eb => [
          with_tags(eb, eb.ref('products.id'), driver.dialectType),
          with_media(eb, eb.ref('products.id'), driver.dialectType),
          with_search(eb, eb.ref('products.id'), driver.dialectType),

          expand_collections && 
          products_with_collections(
            eb, eb.ref('products.id'), driver.dialectType
          ),

          expand_discounts && 
          products_with_discounts(
            eb, eb.ref('products.id'), driver.dialectType
          ),

          expand_variants && 
          products_with_variants(
            eb, eb.ref('products.id'), driver.dialectType
          ),

          expand_related_products && 
          products_with_related_products(
            eb, eb.ref('products.id'), driver.dialectType
          ),
        ].filter(Boolean)
      ),
      query, table_name
    ).execute();

    if(query.limitToLast) 
      items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_used_products_tags"]}
 */
const list_used_products_tags = (driver) => {
  return async () => {

    const items = await driver.client
      .selectFrom('products')
      .innerJoin(
        'entity_to_tags_projections', 
        'entity_to_tags_projections.entity_id', 
        'products.id'
      )
      .select('entity_to_tags_projections.value as tag')
      .groupBy('tag')
      .execute();

      // .compile();
      // console.log(items[0])

    return items.map(e => e.tag);
  }
}


/**
 * @param {SQL} driver 
 * 
 * @returns {db_col["changeStockOfBy"]}
 */
const changeStockOfBy = (driver) => {
  return async (product_ids_or_handles, deltas) => {
    try {
      await driver.client.transaction().execute(
        async (trx) => {
          for(let ix=0; ix < product_ids_or_handles.length; ix++ ) {
            const id = product_ids_or_handles[ix];
            const delta = deltas[ix];
  
            await trx
            .updateTable('products')
            .set(
              eb => (
                {
                  qty: eb('qty', '+', delta)
                }
              )
            )
            .where(
              where_id_or_handle_table(id)
            )
            .execute()
          }
        }
      );
    } catch(e) {
      console.log(e);
      return false;
    }

    return true;
  }
}


/** 
 * @param {SQL} driver
 * 
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {
    changeStockOfBy: changeStockOfBy(driver),
    get: get(driver),
    getBulk: getBulk(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_used_products_tags: list_used_products_tags(driver),
    count: count_regular(driver, table_name),
  }
}
