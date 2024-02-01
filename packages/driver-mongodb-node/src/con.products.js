import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { getByHandle_regular, get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js'

/**
 * @typedef {import('@storecraft/core').db_products} db_col
 */

/**
 * @param {Driver} d 
 * @returns {Collection<Partial<db_col["$type"]>>}
 */
const col = (d) => {
  return d.collection('products')
}

/**
 * @param {Driver} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    
    const filter = { _id: to_objid(data.id) };
    const replacement = { ...data };
    const options = { upsert: true };

    const res = await driver.products._col.replaceOne(
      filter, replacement, options
    );

    return;
  }
}

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
 * @returns {db_col["add_product_to_collection"]}
 */
const add_product_to_collection = (driver) => {
  return async (product, collection) => {

    await driver.products._col.updateOne(
      handle_or_id(product),
      { $addToSet: { _collections: collection } }
    );

    await driver.collections._col.updateOne(
      handle_or_id(collection),
      { $addToSet: { _products: product } }
    );

  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["remove_product_from_collection"]}
 */
const remove_product_from_collection = (driver) => {
  return async (product, collection) => {

    await driver.products._col.updateOne(
      handle_or_id(product),
      { $pull: { _collections: collection } }
    );

    await driver.collections._col.updateOne(
      handle_or_id(collection),
      { $pull: { _products: product } }
    );

  }
}


/** 
 * @param {Driver} driver
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {
  driver
  return {
    _col: col(driver),
    get: get(driver),
    getByHandle: getByHandle(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    add_product_to_collection: add_product_to_collection(driver),
    remove_product_from_collection: remove_product_from_collection(driver),
  }
}
