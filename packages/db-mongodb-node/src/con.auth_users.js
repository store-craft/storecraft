import { Database } from '../driver.js'
import { Collection } from 'mongodb'
import { sanitize, to_objid } from './utils.funcs.js'
import { get_regular, list_regular, upsert_regular } from './con.shared.js'

/**
 * @typedef {import('@storecraft/core').db_auth_users} db_col
 */

/**
 * @param {Database} d 
 * @returns {Collection<import('@storecraft/core').AuthUserType>}
 */
const col = (d) => d.collection('auth_users');

/**
 * @param {Database} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {Database} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {Database} driver 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    const filter = { email: email };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return sanitize(res)
  }
}

/**
 * @param {Database} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const filter = { _id: to_objid(id) };

    /** @type {import('@storecraft/core').AuthUserType} */
    const res = await col(driver).findOneAndDelete(
      filter
    );

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
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
