import { MongoDB } from '../driver.js'
import { sanitize_one, to_objid } from './utils.funcs.js'
import { get_regular, list_regular, upsert_regular } from './con.shared.js'
import { Collection } from '../data-api-client/index.js';

/**
 * @typedef {import('@storecraft/core').db_auth_users} db_col
 */

/**
 * @param {MongoDB} d 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('auth_users');

/**
 * @param {MongoDB} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    const filter = { email: email };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return sanitize_one(res)
  }
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const res = await col(driver).deleteOne(
      { _id: to_objid(id) }
    );

    return Boolean(res.deletedCount)
  }
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["removeByEmail"]}
 */
const removeByEmail = (driver) => {
  return async (email) => {
    /** @type {import('@storecraft/core').AuthUserType} */
    await col(driver).deleteOne(
      { email }
    );

    return
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
    removeByEmail: removeByEmail(driver),
    list: list(driver)
  }
}