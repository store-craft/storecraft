import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { getByHandle_regular, get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js'

/**
 * @typedef {import('@storecraft/core').db_collections} db_col
 */

/**
 * @param {Driver} d 
 * @returns {Collection<db_col["$type"]>}
 */
const col = (d) => {
  return d.collection('collections')
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
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const res = await col(driver).findOneAndDelete(
      { _id: to_objid(id) }
    );

    // remove from products
    await driver.products._col.updateMany(
      { collections: res.handle },
      {
        $pull: { collections: res.handle, search: `col:${res.handle}` },
      }
    );

    // remove from storefronts
    await driver.storefronts._col.updateMany(
      { collections: res.handle },
      {
        $pull: { collections: res.handle },
      }
    );

    return
  }
}


/**
 * @param {Driver} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/** 
 * @param {Driver} driver
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    getByHandle: getByHandle(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
