import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { query_to_mongo } from './utils.query.js';
import { isDef, sanitize } from './utils.funcs.js';

/**
 * @typedef {import('@storecraft/core').db_orders} db_col
 */

/**
 * @param {Database} d 
 * @returns {Collection<db_col["$type"]>}
 */
const col = (d) => d.collection('orders');

/**
 * @param {Database} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {Database} driver 
 */
const get = (driver) => get_regular(driver, col(driver));


/**
 * @param {Database} driver 
 */
const remove = (driver) => remove_regular(driver, col(driver));

/**
 * @param {Database} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {Database} driver 
 * @returns {db_col["list_customer_orders"]}
 */
const list_customer_orders = (driver) => {
  return async (customer_id, query) => {

    const { filter: filter_query, sort } = query_to_mongo(query);

    console.log('query', query)
    console.log('filter', JSON.stringify(filter_query, null, 2))
    console.log('sort', sort)
    console.log('expand', query?.expand)
    
    const filter = {
      $and: [
        { search: `customer:${customer_id}` },
      ]
    };

    // add the query filter
    isDef(filter_query) && filter.$and.push(filter_query);

    const items = await driver.orders._col.find(
      filter,  {
        sort, limit: query.limit
      }
    ).toArray();

    return sanitize(items);
  }
}

/** 
 * @param {Database} driver
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {
  driver
  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_customer_orders: list_customer_orders(driver) 
  }
}
