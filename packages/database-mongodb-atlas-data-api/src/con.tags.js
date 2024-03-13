import { Collection } from '../data-api-client/index.js'
import { MongoDB } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_tags} db_col
 */


/**
 * @param {MongoDB} d 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('tags');

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
 */
const remove = (driver) => remove_regular(driver, col(driver));

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
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
