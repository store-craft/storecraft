import { MongoDB } from '../index.js'
import { Collection } from 'mongodb'
import { objid_or_else_filter, sanitize_one, to_objid_safe } from './utils.funcs.js'
import { 
  count_regular, get_regular, list_regular, upsert_regular 
} from './con.shared.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_auth_users} db_col
 */

/**
 * @param {MongoDB} d 
 * 
 * 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('auth_users');

/**
 * @param {MongoDB} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["get"]}
 */
const get2 = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["getByEmail"]}
 */
const get = (driver) => {
  return async (id_or_email) => {
    const filter = objid_or_else_filter(id_or_email, 'email');

    /** @type {import('@storecraft/core/v-api').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return sanitize_one(res)
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["getByEmail"]}
 */
const getByEmail = (driver) => {
  return async (email) => {
    const filter = { email: email };

    /** @type {import('@storecraft/core/v-api').AuthUserType} */
    const res = await col(driver).findOne(
      filter
    );

    return sanitize_one(res)
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {

    let filter;

    {
      if(to_objid_safe(id)) { 
        filter = {
          _id: to_objid_safe(id)
        }
      } else {
        filter = {
          email: id
        }
      }
    }

    const res = await col(driver).deleteOne(
      filter
    );

    return Boolean(res.deletedCount)
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["removeByEmail"]}
 */
const removeByEmail = (driver) => {
  return async (email) => {
    /** @type {import('@storecraft/core/v-api').AuthUserType} */
    await col(driver).deleteOne(
      { email }
    );

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
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    getByEmail: getByEmail(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    removeByEmail: removeByEmail(driver),
    list: list(driver),
    count: count(driver)
  }
}
