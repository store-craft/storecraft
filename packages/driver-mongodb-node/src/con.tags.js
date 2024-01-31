import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { getByHandle_regular, get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'

/**
 * @typedef {import('@storecraft/core').db_tags} db_col
 */


/**
 * @param {Driver} d 
 * @returns {Collection<import('@storecraft/core').TagType>}
 */
const col = (d) => {
  return d.client.db(d.name).collection('tags')
}

/**
 * @param {Driver} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {Driver} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {Driver} driver 
 */
const getByHandle = (driver) => getByHandle_regular(driver, col(driver));

/**
 * @param {Driver} driver 
 */
const remove = (driver) => remove_regular(driver, col(driver));

/**
 * @param {Driver} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/** 
 * @param {Driver} driver
 * @return {db_col}
 * */
export const impl = (driver) => {
  driver
  return {
    get: get(driver),
    getByHandle: getByHandle(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
