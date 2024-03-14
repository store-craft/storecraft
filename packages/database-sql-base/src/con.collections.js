import { SQL } from '../driver.js'
import { report_document_media } from './con.images.js'
import { delete_entity_values_by_value_or_reporter, delete_me, 
  delete_media_of, delete_search_of, delete_tags_of, 
  insert_media_of, insert_search_of, insert_tags_of, 
  select_entity_ids_by_value_or_reporter, 
  upsert_me, where_id_or_handle_table, 
  with_media, with_tags } from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'


/**
 * @typedef {import('@storecraft/core/v-database').db_collections} db_col
 */
export const table_name = 'collections'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item, search_terms) => {
    const c = driver.client;
    try {
      const t = await driver.client.transaction().execute(
        async (trx) => {

          // entities
          await insert_tags_of(trx, item.tags, item.id, item.handle, table_name);
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await insert_media_of(trx, item.media, item.id, item.handle, table_name);
          await report_document_media(driver)(item, trx);
          // main
          await upsert_me(trx, table_name, item.id, {
            
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            published: item.published,
            title: item.title
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

    const r = await driver.client
      .selectFrom(table_name)
      .selectAll('collections')
      .select(eb => [
        with_tags(eb, eb.ref('collections.id'), driver.dialectType),
        with_media(eb, eb.ref('collections.id'), driver.dialectType)
      ])
      .where(where_id_or_handle_table(id_or_handle))
    //  .compile()
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
          await delete_tags_of(trx, id_or_handle);
          await delete_search_of(trx, id_or_handle);
          await delete_media_of(trx, id_or_handle);
          // PRODUCTS -> COLLECTIONS
          await delete_entity_values_by_value_or_reporter('products_to_collections')(
            trx, id_or_handle, id_or_handle
          );
          // STOREFRONT => COLLECTIONS
          await delete_entity_values_by_value_or_reporter('storefronts_to_other')(
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

    const items = await driver.client.selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_tags(eb, eb.ref('collections.id'), driver.dialectType),
        with_media(eb, eb.ref('collections.id'), driver.dialectType),
      ])
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name).eb;
        }
      )
      .orderBy(query_to_sort(query))
      .limit(query.limit ?? 10)
      .execute();
    
    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_collection_products"]}
 */
const list_collection_products = (driver) => {
  return async (handle_or_id, query={}) => {

    const items = await driver.client
      .selectFrom('products')
      .selectAll()
      .select(eb => [
        with_media(eb, eb.ref('products.id'), driver.dialectType),
        with_tags(eb, eb.ref('products.id'), driver.dialectType),
      ])
      .where(
        (eb) => eb.and(
          [
            query_to_eb(eb, query, 'products')?.eb,
            eb('products.id', 'in', 
              eb => select_entity_ids_by_value_or_reporter( // select all the product ids by collection id
                eb, 'products_to_collections', handle_or_id
              )
            )
          ].filter(Boolean)
        )
      )
      .orderBy(query_to_sort(query))
      .limit(query?.limit ?? 10)
      .execute();

    return sanitize_array(items);
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
    list_collection_products: list_collection_products(driver)
  }
}
