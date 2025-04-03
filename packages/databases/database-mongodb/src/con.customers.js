/**
 * @import { db_customers as db_col } from '@storecraft/core/database'
 * @import { OrderData } from '@storecraft/core/api'
 * @import { WithRelations } from './utils.types.js'
 * @import { Filter } from 'mongodb'
 */

import { Collection, ObjectId } from 'mongodb'
import { MongoDB } from '../index.js'
import { count_regular, get_regular, list_regular, 
  upsert_regular } from './con.shared.js'
import { handle_or_id, isDef, sanitize_array, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js';

/**
 * @param {MongoDB} d 
 * 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('customers');

/**
 * @param {MongoDB} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    return col(driver).findOne(
      { email }
    );
  }
}

/**
 * 
 * @param {string} email_or_id 
 * 
 * 
 * @returns { {_id:ObjectId} | {email: string}}
 */
export const email_or_id = (email_or_id) => {
  let r = {};
  try {
    r._id = to_objid(email_or_id);
  } catch (e) {
    r.email = email_or_id;
  }
  return r;
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {

    const session = driver.mongo_client.startSession();
    try {
      await session.withTransaction(
        async () => {
          const res = await col(driver).findOneAndDelete(
            handle_or_id(id),
            { session }
          );
      
          // delete the auth user
          if(res?.auth_id) {
            await driver.resources.auth_users._col.deleteOne(
              { _id: to_objid(res.auth_id) },
              { session }
            );
          }
        }
      );
    } catch(e) {
      console.log(e);
      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }
}


/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const count = (driver) => count_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_customer_orders"]}
 */
const list_customer_orders = (driver) => {
  return async (customer_id, query) => {

    const { filter: filter_query, sort, reverse_sign } = query_to_mongo(query);

    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter_query, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)
    
    /** @type {Filter<WithRelations<OrderData>>} */
    const filter = {
      $and: [
        {'_relations.search': `customer:${customer_id}` },
      ]
    };

    // add the query filter
    isDef(filter_query) && filter.$and.push(filter_query);

    const items = await driver.resources.orders._col.find(
      filter, {
        sort, limit: reverse_sign==-1 ? query.limitToLast : query.limit
      }
    ).toArray();

    if(reverse_sign==-1) items.reverse();

    return sanitize_array(items);
  }
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["count_customer_orders"]}
 */
const count_customer_orders = (driver) => {
  return async (customer_id, query) => {

    const { filter: filter_query } = query_to_mongo(query);

    /** @type {Filter<WithRelations<OrderData>>} */
    const filter = {
      $and: [
        {'_relations.search': `customer:${customer_id}` },
      ]
    };

    // add the query filter
    isDef(filter_query) && filter.$and.push(filter_query);

    const count = await driver.resources.orders._col.countDocuments(
      filter
    );

    return count;
  }
}


/** 
 * @param {MongoDB} driver
 * 
 * 
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver),
    list_customer_orders: list_customer_orders(driver),
    count_customer_orders: count_customer_orders(driver),
  }
}
