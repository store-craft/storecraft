import { enums } from '@storecraft/core/v-api'
import { SQL } from '../driver.js'
import { delete_entity_values_of_by_entity_id_or_handle, delete_me, delete_media_of, 
  delete_search_of, delete_tags_of, 
  insert_entity_values_of, insert_media_of, insert_search_of, 
  insert_tags_of, regular_upsert_me, 
  where_id_or_handle_table, products_with_collections, 
  with_tags, with_media, 
  delete_entity_values_by_value_or_reporter,
  products_with_discounts,
  products_with_variants,
  count_regular} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'
import { pricing } from '@storecraft/core/v-api'
import { Transaction } from 'kysely'
import { report_document_media } from './con.images.js'


/**
 * @typedef {import('@storecraft/core/v-database').db_products} db_col
 */
export const table_name = 'products'

/**
 * 
 * @param {db_col["$type_get"]} item 
 * @returns 
 */
const is_variant = item => {
  return item?.parent_handle && item?.parent_id && 
  item?.variant_hint
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
        eb => eb.and([
          eb('active', '=', 1),
          eb('_application_id', '=', enums.DiscountApplicationEnum.Auto.id),
        ])
      ).execute();
      const eligible_discounts = discounts.filter(
        d => pricing.test_product_filters_against_product(d.info.filters, item)
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
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            title: item.title,
            compare_at_price: item.compare_at_price,
            price: item.price,
            video: item.video,
            qty: item.qty,
            variants_options: JSON.stringify(item.variants_options),
            // no variants yet
            parent_handle: item.parent_handle,
            parent_id: item.parent_id,
            variant_hint: JSON.stringify(item.variant_hint),
          });

          // PRODUCTS => VARIANTS
          if(is_variant(item)) {
            // remove previous
            await delete_entity_values_by_value_or_reporter('products_to_variants')(
              trx, item.id, item.handle
            );
            // add 
            await insert_entity_values_of('products_to_variants')(
              trx, [{ value: item.id, reporter: item.handle }], 
              item.parent_id, item.parent_handle, 
            );
          }

          // Explicit PRODUCTS => COLLECTIONS
          // remove this product's old collections connections
          await delete_entity_values_of_by_entity_id_or_handle('products_to_collections')(
            trx, item.id, item.handle
          );
          if(item.collections) {
            // add this product's new collections connections
            await insert_entity_values_of('products_to_collections')(
              trx, item.collections.map(c => ({ value: c.id, reporter: c.handle })), 
              item.id, item.handle, 
            );
          }

          // PRODUCTS => DISCOUNTS
          // remove this product's older connections to discounts
          await delete_entity_values_of_by_entity_id_or_handle('products_to_discounts')(
            trx, item.id, item.handle, 
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
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return async (id_or_handle, options) => {

    const expand = options?.expand ?? ['*'];
    const expand_collections = expand.includes('*') || expand.includes('collections');
    const expand_discounts = expand.includes('*') || expand.includes('discounts');
    const expand_variants = expand.includes('*') || expand.includes('variants');
    const dtype = driver.config.dialect_type;
    const r = await driver.client
    .selectFrom(table_name)
    .selectAll('products')
    .select(eb => [
      with_tags(eb, id_or_handle, dtype),
      with_media(eb, id_or_handle, dtype),
      expand_collections && products_with_collections(eb, id_or_handle, dtype),
      expand_discounts && products_with_discounts(eb, id_or_handle, dtype),
      expand_variants && products_with_variants(eb, id_or_handle, dtype)
    ].filter(Boolean)
    )
    .where(where_id_or_handle_table(id_or_handle))
    // .compile()
    .executeTakeFirst();

    return sanitize(r);
  }
}


/**
 * @param {SQL} driver 
 */
const remove_internal = (driver) => {
  /**
   * @param {import('@storecraft/core/v-api').ProductType & 
   *  import('@storecraft/core/v-api').VariantType
   * } product
   * @param {Transaction<import('../index.js').Database>} trx
   */
  return async (product, trx) => {
    // entities
    await delete_tags_of(trx, product.id);
    await delete_search_of(trx, product.id);
    await delete_media_of(trx, product.id);
    // PRODUCTS => COLLECTIONS
    await delete_entity_values_of_by_entity_id_or_handle('products_to_collections')(
      trx, product.id, product.handle
    );
    // PRODUCTS => DISCOUNTS
    await delete_entity_values_of_by_entity_id_or_handle('products_to_discounts')(
      trx, product.id, product.handle
    );
    // STOREFRONT => PRODUCT
    await delete_entity_values_by_value_or_reporter('storefronts_to_other')(
      trx, product.id, product.handle
    );
    // PRODUCT => VARIANTS
    // delete all of it's variants
    {
      if(is_variant(product)) {
        // delete my reported connections
        await delete_entity_values_by_value_or_reporter('products_to_variants')(
          trx, product.id, product.handle
        );
      } else { // parent
        await Promise.all(
          (product.variants ?? []).map(v => remove_internal(driver)(v, trx))
        );
        // if I am a parent product, delete my relations to all previous variants
        await delete_entity_values_of_by_entity_id_or_handle('products_to_variants')(
          trx, product.id, product.handle
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
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const expand = query.expand ?? ['*'];
    const expand_collections = expand.includes('*') || expand.includes('collections');
    const expand_discounts = expand.includes('*') || expand.includes('discounts');
    const expand_variants = expand.includes('*') || expand.includes('variants');
    const items = await driver.client
    .selectFrom(table_name)
    .selectAll()
    .select(eb => [
      with_tags(eb, eb.ref('products.id'), driver.dialectType),
      with_media(eb, eb.ref('products.id'), driver.dialectType),
      expand_collections && products_with_collections(eb, eb.ref('products.id'), driver.dialectType),
      expand_discounts && products_with_discounts(eb, eb.ref('products.id'), driver.dialectType),
      expand_variants && products_with_variants(eb, eb.ref('products.id'), driver.dialectType)
    ].filter(Boolean))
    .where(
      (eb) => {
        return query_to_eb(eb, query, table_name);
      }
    ).orderBy(query_to_sort(query))
    .limit(query.limitToLast ?? query.limit ?? 10)
    .execute();

  if(query.limitToLast) items.reverse();
    // .compile();
        // console.log(items)
    
    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_product_collections"]}
 */
const list_product_collections = (driver) => {
  return async (product_id_or_handle) => {
    // we don't expect many collections per products,
    // therefore we use the simple `get` method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['collections'] }
    );
    return item?.collections ?? []
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_product_discounts"]}
 */
const list_product_discounts = (driver) => {
  return async (product_id_or_handle) => {
    // we don't expect many discounts per products,
    // therefore we use the simple `get` method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['discounts'] }
    );
    return item?.discounts ?? []
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_product_variants"]}
 */
const list_product_variants = (driver) => {
  return async (product_id_or_handle) => {
    // we don't expect many discounts per products,
    // therefore we use the simple `get` method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['variants'] }
    );
    return item?.variants ?? []
  }
}

/** 
 * @param {SQL} driver
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {

    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_product_collections: list_product_collections(driver),
    list_product_discounts: list_product_discounts(driver),
    list_product_variants: list_product_variants(driver),
    count: count_regular(driver, table_name),
  }
}
