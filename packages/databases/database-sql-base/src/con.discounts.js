/**
 * @import { db_discounts as db_col } from '@storecraft/core/database'
 */
import { enums } from '@storecraft/core/api'
import { SQL } from '../index.js'
import { discount_to_conjunctions } from './con.discounts.utils.js'
import { delete_entity_values_by_value_or_reporter, 
  delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_media_of, insert_search_of, 
  insert_tags_of, select_entity_ids_by_value_or_reporter, regular_upsert_me, where_id_or_handle_table, 
  with_media, with_tags,
  count_regular,
  with_search} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'
import { report_document_media } from './con.images.js'

export const table_name = 'discounts'

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
          /// ENTITIES
          await insert_search_of(trx, search_terms, item.id, item.handle, table_name);
          await insert_media_of(trx, item.media, item.id, item.handle, table_name);
          await insert_tags_of(trx, item.tags, item.id, item.handle, table_name);
          await report_document_media(driver)(item, trx);
          //
          // PRODUCTS => DISCOUNTS
          //
          // remove all products relation to this discount
          await delete_entity_values_by_value_or_reporter('products_to_discounts')(
            trx, item.id, item.handle);

          await delete_entity_values_by_value_or_reporter('entity_to_search_terms')(
            trx, `discount:${item.id}`);
          await delete_entity_values_by_value_or_reporter('entity_to_search_terms')(
            trx, `discount:${item.handle}`);

          if(item.active && item.application.id===enums.DiscountApplicationEnum.Auto.id) {
            // make connections
            await trx
            .insertInto('products_to_discounts')
            .columns(['entity_handle', 'entity_id', 'value', 'reporter'])
            .expression(eb => 
              eb.selectFrom('products')
                .select(eb => [
                    'handle as entity_handle',
                    'id as entity_id',
                    eb.val(item.id).as('value'),
                    eb.val(item.handle).as('reporter')
                  ]
                )
                .where(
                  eb => eb.and(discount_to_conjunctions(eb, item))
                )
            ).execute();

            await trx
            .insertInto('entity_to_search_terms')
            .columns(['entity_handle', 'entity_id', 'value'])
            .expression(eb => 
              eb.selectFrom('products')
                .select(eb => [
                    'handle as entity_handle',
                    'id as entity_id',
                    eb.val(`discount:${item.id}`).as('value'),
                  ]
                )
                .where(
                  eb => eb.and(discount_to_conjunctions(eb, item))
                )
            ).execute();      

            await trx
            .insertInto('entity_to_search_terms')
            .columns(['entity_handle', 'entity_id', 'value'])
            .expression(eb => 
              eb.selectFrom('products')
                .select(eb => [
                    'handle as entity_handle',
                    'id as entity_id',
                    eb.val(`discount:${item.handle}`).as('value'),
                  ]
                )
                .where(
                  eb => eb.and(discount_to_conjunctions(eb, item))
                )
            ).execute();                     
          }

          ///
          /// SAVE ME
          ///
          await regular_upsert_me(trx, table_name, {
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            title: item.title, 
            priority: item.priority ?? 0,
            published: item.published,
            application: JSON.stringify(item.application),
            info: JSON.stringify(item.info),
            _application_id: item.application.id,
            _discount_type_id: item.info.details.meta.id
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
  return (id_or_handle, options) => {
    return driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, id_or_handle, driver.dialectType),
        with_tags(eb, id_or_handle, driver.dialectType),
        with_search(eb, id_or_handle, driver.dialectType),
      ].filter(Boolean))
      .where(where_id_or_handle_table(id_or_handle))
      .executeTakeFirst()
      .then(sanitize);
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
          await delete_media_of(trx, id_or_handle);
          await delete_tags_of(trx, id_or_handle);
          // delete products -> discounts
          // PRODUCTS => DISCOUNTS
          await delete_entity_values_by_value_or_reporter('products_to_discounts')(
            trx, id_or_handle, id_or_handle);
          // STOREFRONT => DISCOUNTS
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

    const items = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, eb.ref('discounts.id'), driver.dialectType),
        with_tags(eb, eb.ref('discounts.id'), driver.dialectType),
        with_search(eb, eb.ref('discounts.id'), driver.dialectType),
      ].filter(Boolean))
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name);
        }
      )
      .orderBy(query_to_sort(query, table_name))
      .limit(query.limitToLast ?? query.limit ?? 10)
      .execute();

    if(query.limitToLast) items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_discount_products"]}
 */
const list_discount_products = (driver) => {
  return async (handle_or_id, query={}) => {

    // TODO: try to rewrite this with JOIN to products_to_discounts ON products.id=entity_id
    // TODO: and then filter by value==handle_or_id_of_discount
    // TODO: I think it will be better and more memory efficient for the database
    // TODO: becausee right now it loads all the eligible products ids in advance
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
            query_to_eb(eb, query, 'products'),
            eb('products.id', 'in', 
              eb => select_entity_ids_by_value_or_reporter( // select all the product ids by discount id
                eb, 'products_to_discounts', handle_or_id
              )
            )
          ].filter(Boolean)
        )
      )
      .orderBy(query_to_sort(query, 'products'))
      .limit(query.limitToLast ?? query.limit ?? 10)
      .execute();

    if(query.limitToLast) items.reverse();

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
    list_discount_products: list_discount_products(driver),
    count: count_regular(driver, table_name),
  }
}
