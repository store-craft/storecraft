import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { get_regular, list_regular, 
  upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js'

/**
 * @typedef {import('@storecraft/core').db_customers} db_col
 */

/**
 * @param {MongoDB} d 
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
            { _id: to_objid(id) },
            { session }
          );
      
          // delete the auth user
          if(res?.auth_id) {
            await driver.auth_users._col.findOneAndDelete(
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
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {
  driver
  return {
    _col: col(driver),
    get: get(driver),
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}