import { SQL } from '../driver.js'
import { report_document_media } from './con.images.js'
import { count_regular, delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_media_of, insert_search_of, 
  insert_tags_of, regular_upsert_me, where_id_or_handle_table, 
  with_media, with_tags} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_orders} db_col
 */
export const table_name = 'orders'

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
          await insert_search_of(trx, search_terms, item.id, item.id, table_name);
          await insert_media_of(trx, item.media, item.id, item.id, table_name);
          await insert_tags_of(trx, item.tags, item.id, item.id, table_name);
          await report_document_media(driver)(item, trx);
          await regular_upsert_me(trx, table_name, {
            active: item.active ? 1: 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.id,
            address: JSON.stringify(item.address),
            contact: JSON.stringify(item.contact),
            coupons: JSON.stringify(item.coupons),
            line_items: JSON.stringify(item.line_items),
            notes: item.notes,
            payment_gateway: JSON.stringify(item.payment_gateway),
            pricing: JSON.stringify(item.pricing),
            shipping_method: JSON.stringify(item.shipping_method),
            status: JSON.stringify(item.status),
            validation: JSON.stringify(item.validation),
            _customer_id: item?.contact?.customer_id,
            _customer_email: item?.contact?.email,
            _status_checkout_id: item?.status?.checkout?.id,
            _status_payment_id: item?.status?.payment?.id,
            _status_fulfillment_id: item?.status?.fulfillment?.id,
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
        with_media(eb, eb.ref('orders.id'), driver.dialectType),
        with_tags(eb, eb.ref('orders.id'), driver.dialectType),
      ].filter(Boolean))
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
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count_regular(driver, table_name),
  }
}
