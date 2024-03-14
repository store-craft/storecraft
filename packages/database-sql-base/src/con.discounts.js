import { DiscountApplicationEnum } from '@storecraft/core/v-api'
import { SQL } from '../driver.js'
import { discount_to_conjunctions } from './con.discounts.utils.js'
import { delete_entity_values_by_value_or_reporter, 
  delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_media_of, insert_search_of, 
  insert_tags_of, select_entity_ids_by_value_or_reporter, upsert_me, where_id_or_handle_table, 
  with_media, with_tags} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'
import { report_document_media } from './con.images.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_discounts} db_col
 */
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
          // remove discount search terms from related products search terms
          // await trx
          //   .deleteFrom('entity_to_search_terms')
          //   .where(eb => eb.and(
          //     [
          //       eb.or(
          //         [
          //           eb('value', '=', `dis:${item.id}`),
          //           eb('value', '=', `dis:${item.handle}`)
          //         ]
          //       ),
          //       eb('context', '=', 'products') // makes sure it is only products records
          //     ])
          //   )
          //   .execute();
          // insert new relations
          // INSERT INTO SELECT FROM
          if(item.active && item.application.id===DiscountApplicationEnum.Auto.id) {
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

            // now add search terms for eligible products

          }

          ///
          /// SAVE ME
          ///
          await upsert_me(trx, table_name, item.id, {
            active: item.active ? 1: 0,
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
  return async (id_or_handle, options) => {
    const r = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, id_or_handle, driver.dialectType),
        with_tags(eb, id_or_handle, driver.dialectType),
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
      ].filter(Boolean))
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
 * @returns {db_col["list_discount_products"]}
 */
const list_discount_products = (driver) => {
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
              eb => select_entity_ids_by_value_or_reporter( // select all the product ids by discount id
                eb, 'products_to_discounts', handle_or_id
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
    list_discount_products: list_discount_products(driver)
  }
}
