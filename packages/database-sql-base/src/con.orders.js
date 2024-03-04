import { SQL } from '../driver.js'
import { delete_me, delete_search_of, insert_media_of, insert_search_of, 
  upsert_me, where_id_or_handle_table, 
  with_media} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_orders} db_col
 */
export const table_name = 'orders'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {
          await insert_search_of(trx, item.search, item.id, item.id);
          await insert_media_of(trx, item.media, item.id, item.id);
          await upsert_me(trx, table_name, item.id, {
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
        with_media(eb, id_or_handle),
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
      const t = await driver.client.transaction().execute(
        async (trx) => {
            
          // entities
          await delete_search_of(trx, id_or_handle);
          // delete me
          const d2 = await delete_me(trx, table_name, id_or_handle);
          return d2.numDeletedRows>0;
        }
      );

      return t;
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
        with_media(eb, eb.ref('orders.id')),
      ].filter(Boolean))
      .where(
        (eb) => {
          return query_to_eb(eb, query).eb;
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
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}

// import { Collection } from 'mongodb'
// import { MongoDB } from '../driver.js'
// import { get_regular, list_regular, 
//   remove_regular, upsert_regular } from './con.shared.js'
// import { query_to_mongo } from './utils.query.js';
// import { isDef, sanitize_array } from './utils.funcs.js';

// /**
//  * @typedef {import('@storecraft/core').db_orders} db_col
//  */

// /**
//  * @param {MongoDB} d 
//  * @returns {Collection<db_col["$type_get"]>}
//  */
// const col = (d) => d.collection('orders');

// /**
//  * @param {MongoDB} driver 
//  */
// const upsert = (driver) => upsert_regular(driver, col(driver));

// /**
//  * @param {MongoDB} driver 
//  */
// const get = (driver) => get_regular(driver, col(driver));


// /**
//  * @param {MongoDB} driver 
//  */
// const remove = (driver) => remove_regular(driver, col(driver));

// /**
//  * @param {MongoDB} driver 
//  */
// const list = (driver) => list_regular(driver, col(driver));

// /**
//  * @param {MongoDB} driver 
//  * @returns {db_col["list_customer_orders"]}
//  */
// const list_customer_orders = (driver) => {
//   return async (customer_id, query) => {

//     const { filter: filter_query, sort } = query_to_mongo(query);

//     console.log('query', query)
//     console.log('filter', JSON.stringify(filter_query, null, 2))
//     console.log('sort', sort)
//     console.log('expand', query?.expand)
    
//     const filter = {
//       $and: [
//         { search: `customer:${customer_id}` },
//       ]
//     };

//     // add the query filter
//     isDef(filter_query) && filter.$and.push(filter_query);

//     const items = await driver.orders._col.find(
//       filter,  {
//         sort, limit: query.limit
//       }
//     ).toArray();

//     return sanitize_array(items);
//   }
// }

// /** 
//  * @param {MongoDB} driver
//  * @return {db_col & { _col: ReturnType<col>}}
//  * */
// export const impl = (driver) => {
//   driver
//   return {
//     _col: col(driver),
//     get: get(driver),
//     upsert: upsert(driver),
//     remove: remove(driver),
//     list: list(driver),
//     list_customer_orders: list_customer_orders(driver) 
//   }
// }
