import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { count_regular, get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js';

/**
 * @typedef {import('@storecraft/core/v-database').db_notifications} db_col
 */

/**
 * @param {MongoDB} d 
 * 
 * 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('notifications');

/**
 * @param {MongoDB} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["upsertBulk"]}
 */
const upsertBulk = (driver) => {
  return async (data) => {
    data.forEach(
      d => {
        d._id = to_objid(d.id);
      }
    );

    const res = await col(driver).insertMany(
      data
    );

    return true;
  }
}

/**
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const remove = (driver) => remove_regular(driver, col(driver));

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
 */
export const impl = (driver) => {
  
  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    upsertBulk: upsertBulk(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver)
  }
}
