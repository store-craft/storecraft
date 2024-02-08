import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js'

/**
 * @typedef {import('@storecraft/core').db_customers} db_col
 */

/**
 * @param {Database} d 
 * @returns {Collection<db_col["$type"]>}
 */
const col = (d) => d.collection('customers');

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
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {

    const res = await col(driver).findOneAndDelete(
      { _id: to_objid(id) }
    );

    // delete the auth user
    if(res?.auth_id) {
      await driver.auth_users._col.findOneAndDelete(
        { _id: to_objid(res.auth_id) }
      );
    }

    return
  }
}
/**
 * @param {Database} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

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
    list: list(driver)
  }
}
