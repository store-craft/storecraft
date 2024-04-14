import { SQL } from '../driver.js'
import { report_document_media } from './con.images.js'
import { delete_entity_values_of_by_entity_id_or_handle, 
  delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_entity_values_of, insert_media_of, 
  insert_search_of, insert_tags_of, storefront_with_collections, 
  storefront_with_discounts, storefront_with_posts, 
  storefront_with_products, storefront_with_shipping, 
  regular_upsert_me, where_id_or_handle_table, 
  with_media, with_tags, 
  count_regular} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_storefronts} db_col
 */
export const table_name = 'storefronts'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item, search_terms) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {
          // regular entities
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await insert_media_of(trx, item.media, item.id, item.handle, table_name);
          await insert_tags_of(trx, item.tags, item.id, item.handle, table_name);
          await report_document_media(driver)(item, trx);
          // Explicit STOREFRONTS => PRODUCTS / COLLECTIONS / DISCOUNTS / SHIPPING / POSTS
          // remove all the past connections of this storefront at once
          await delete_entity_values_of_by_entity_id_or_handle('storefronts_to_other')(
            trx, item.id, item.handle
          );
          if(item.collections) { // add this storefront's new collections connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.collections.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'collections'
            );
          }
          if(item.products) { // add this storefront's new products connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.products.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'products'
            );
          }
          if(item.discounts) { // add this storefront's new discounts connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.discounts.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'discounts'
            );
          }
          if(item.posts) { // add this storefront's new posts connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.posts.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'posts'
            );
          }
          if(item.shipping_methods) { // add this storefront's new shipping_methods connections
            await insert_entity_values_of('storefronts_to_other')(
              trx, item.shipping_methods.map(c => ({ value: c.id, reporter: c.handle})), 
              item.id, item.handle, 'shipping_methods'
            );
          }

          // upsert me
          await regular_upsert_me(trx, table_name, {
            active: item.active ? 1: 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            published: item.published, 
            title: item.title,
            video: item.video
          });
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
    const expand_all = expand.includes('*');
    const expand_collections = expand_all || expand.includes('collections');
    const expand_products = expand_all || expand.includes('products');
    const expand_discounts = expand_all || expand.includes('discounts');
    const expand_shipping = expand_all || expand.includes('shipping_methods');
    const expand_posts = expand_all || expand.includes('posts');

    const r = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, id_or_handle, driver.dialectType),
        with_tags(eb, id_or_handle, driver.dialectType),
        expand_collections && storefront_with_collections(eb, id_or_handle, driver.dialectType),
        expand_products && storefront_with_products(eb, id_or_handle, driver.dialectType),
        expand_discounts && storefront_with_discounts(eb, id_or_handle, driver.dialectType),
        expand_shipping && storefront_with_shipping(eb, id_or_handle, driver.dialectType),
        expand_posts && storefront_with_posts(eb, id_or_handle, driver.dialectType),
      ].filter(Boolean))
      .where(where_id_or_handle_table(id_or_handle))
      .executeTakeFirst();

    return sanitize(r);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    try {
      await driver.client.transaction().execute(
        async (trx) => {
            
          // entities
          await delete_search_of(trx, id_or_handle);
          await delete_tags_of(trx, id_or_handle);
          await delete_media_of(trx, id_or_handle);
          // delete storefront => other
          await delete_entity_values_of_by_entity_id_or_handle('storefronts_to_other')(
            trx, id_or_handle, id_or_handle
          );
          // delete me
          await delete_me(trx, table_name, id_or_handle);
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
    const expand = query?.expand ?? ['*'];
    const expand_all = expand.includes('*');
    const expand_collections = expand_all || expand.includes('collections');
    const expand_products = expand_all || expand.includes('products');
    const expand_discounts = expand_all || expand.includes('discounts');
    const expand_shipping = expand_all || expand.includes('shipping_methods');
    const expand_posts = expand_all || expand.includes('posts');

    const items = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
          with_media(eb, eb.ref('storefronts.id'), driver.dialectType),
          with_tags(eb, eb.ref('storefronts.id'), driver.dialectType),
          expand_collections && storefront_with_collections(eb, eb.ref('storefronts.id'), driver.dialectType),
          expand_products && storefront_with_products(eb, eb.ref('storefronts.id'), driver.dialectType),
          expand_discounts && storefront_with_discounts(eb, eb.ref('storefronts.id'), driver.dialectType),
          expand_shipping && storefront_with_shipping(eb, eb.ref('storefronts.id'), driver.dialectType),
          expand_posts && storefront_with_posts(eb, eb.ref('storefronts.id'), driver.dialectType),
        ].filter(Boolean)
      )
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name);
        }
      )
      .orderBy(query_to_sort(query))
      .limit(query.limitToLast ?? query.limit ?? 10)
      .execute();

    if(query.limitToLast) items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_storefront_products"]}
 */
const list_storefront_products = (driver) => {
  return async (product_id_or_handle) => {
    // because we load everything (we don't expect storefronts to
    // promote so many products), therefore we use the simple `get`
    // method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['products'] }
    );
    return item?.products ?? []
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_storefront_collections"]}
 */
const list_storefront_collections = (driver) => {
  return async (product_id_or_handle) => {
    // because we load everything (we don't expect storefronts to
    // promote so many products), therefore we use the simple `get`
    // method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['collections'] }
    );
    return item?.collections ?? []
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_storefront_discounts"]}
 */
const list_storefront_discounts = (driver) => {
  return async (product_id_or_handle) => {
    // because we load everything (we don't expect storefronts to
    // promote so many products), therefore we use the simple `get`
    // method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['discounts'] }
    );
    return item?.discounts ?? []
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_storefront_posts"]}
 */
const list_storefront_posts = (driver) => {
  return async (product_id_or_handle) => {
    // because we load everything (we don't expect storefronts to
    // promote so many products), therefore we use the simple `get`
    // method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['posts'] }
    );
    return item?.posts ?? []
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_storefront_shipping_methods"]}
 */
const list_storefront_shipping_methods = (driver) => {
  return async (product_id_or_handle) => {
    // because we load everything (we don't expect storefronts to
    // promote so many products), therefore we use the simple `get`
    // method instead of a query
    const item = await get(driver)(
      product_id_or_handle, { expand: ['shipping_methods'] }
    );
    return item?.shipping_methods ?? []
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
    list_storefront_products: list_storefront_products(driver),
    list_storefront_collections: list_storefront_collections(driver),
    list_storefront_discounts: list_storefront_discounts(driver),
    list_storefront_posts: list_storefront_posts(driver),
    list_storefront_shipping_methods: list_storefront_shipping_methods(driver),
    count: count_regular(driver, table_name),
  }
}

