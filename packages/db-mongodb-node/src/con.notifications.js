import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'

/**
 * @typedef {import('@storecraft/core').db_notifications} db_col
 */

/**
 * @param {Database} d 
 * @returns {Collection<db_col["$type"]>}
 */
const col = (d) => d.collection('notifications');

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
