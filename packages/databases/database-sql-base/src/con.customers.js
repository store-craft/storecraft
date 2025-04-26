/**
 * @import { db_customers as db_col } from '@storecraft/core/database'
 */
import { SQL } from '../index.js'
import { report_document_media } from './con.images.js'
import { count_regular, delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_media_of, insert_search_of, 
  insert_tags_of, regular_upsert_me, where_id_or_handle_table, 
  with_media, with_search, with_tags} from './con.shared.js'
import { sanitize, sanitize_array } from './utils.funcs.js'
import { query_to_eb, withQuery, withSort } from './utils.query.js'

export const table_name = 'customers'

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
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            handle: item.email,
            id: item.id,
            email: item.email,
            address: JSON.stringify(item.address),
            auth_id: item.auth_id,
            firstname: item.firstname,
            lastname: item.lastname,
            phone_number: item.phone_number
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
  return (id, options) => {
    return driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, id, driver.dialectType),
        with_tags(eb, id, driver.dialectType),
        with_search(eb, id, driver.dialectType),
      ])
      .where(where_id_or_handle_table(id))
      .executeTakeFirst()
      .then(sanitize);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    return get(driver)(email);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
export const remove = (driver) => {
  return async (handle_or_id) => {
    try {
      await driver.client.transaction().execute(
        async (trx) => {

          // entities
          await delete_tags_of(trx, handle_or_id, handle_or_id, table_name);
          await delete_search_of(trx, handle_or_id, handle_or_id, table_name);
          await delete_media_of(trx, handle_or_id, handle_or_id, table_name);
          
          { // delete related auth user
            // customers and auth_users have the same object-id and handle
            let auth_user_handle_or_id = handle_or_id;
            if(handle_or_id.startsWith('cus_')) {
              // found an id
              const object_id = handle_or_id.split('_').at(-1);
              auth_user_handle_or_id = 'au_' + object_id;
            } 

            await delete_me(trx, 'auth_users', auth_user_handle_or_id);
          }
             
          // delete customer
          await delete_me(trx, table_name, handle_or_id);
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

    const items = await withQuery(
      driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, eb.ref('customers.id'), driver.dialectType),
        with_tags(eb, eb.ref('customers.id'), driver.dialectType),
        with_search(eb, eb.ref('customers.id'), driver.dialectType),
      ].filter(Boolean)), 
      query, table_name
  ).execute();
  
    // .where(
    //   (eb) => {
    //     return query_to_eb(eb, query, table_name);
    //   }
  // .orderBy(query_to_sort(query, table_name))
      // .limit(query.limitToLast ?? query.limit ?? 10)
      // .execute();

    if(query.limitToLast) items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_customer_orders"]}
 */
const list_customer_orders = (driver) => {
  return async (id, query) => {

    const items = await withSort(
      driver.client
      .selectFrom('orders')
      .selectAll()
      .select(eb => [
        with_media(eb, eb.ref('orders.id'), driver.dialectType),
        with_tags(eb, eb.ref('orders.id'), driver.dialectType),
      ])
      .where(
        (eb) => eb.and(
          [
            query_to_eb(eb, query, table_name),
            eb.or(
              [
                eb('_customer_id', '=', id),
                eb('_customer_email', '=', id),
              ]
            )
          ].filter(Boolean)
        )
      )
      .limit(query.limitToLast ?? query.limit ?? 10),
      query, 'orders'
    ).execute();
      // .orderBy(query_to_sort(query, 'orders'))
      // .execute();

    if(query.limitToLast) 
      items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["count_customer_orders"]}
 */
const count_customer_orders = (driver) => {
  return async (customer_id_or_email, query) => {

    const result = await driver.client
      .selectFrom('orders')
      .select(
        (eb) => eb.fn.countAll().as('count')
      )
      .where(
        (eb) => eb.and(
          [
            query_to_eb(eb, query, table_name),
            eb.or(
              [
                eb('_customer_id', '=', customer_id_or_email),
                eb('_customer_email', '=', customer_id_or_email),
              ]
            )
          ].filter(Boolean)
        )
      )
      .executeTakeFirst();

    return Number(result.count);
  }
}

/** 
 * @param {SQL} driver
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {
    get: get(driver),
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_customer_orders: list_customer_orders(driver),
    count_customer_orders: count_customer_orders(driver),
    count: count_regular(driver, table_name),
  }
}
