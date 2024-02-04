import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { getByHandle_regular, get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { handle_or_id, sanitize, to_objid } from './utils.funcs.js'

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
const remove = (driver) => remove_regular(driver, col(driver));

/**
 * @param {Driver} driver 
 */
const list = (driver) => list_regular(driver, col(driver));


/**
 * @param {Driver} driver 
 * @returns {db_col["add_product_to_collections"]}
 */
const add_product_to_collections = (driver) => {
  return async (product, collections_handles=[]) => {

    await driver.products._col.updateOne(
      handle_or_id(product),
      { $addToSet: { collections:{ $each: collections_handles } } }
    );

  }
}

/**
 * @param {Driver} driver 
 * @returns {db_col["remove_product_from_collections"]}
 */
const remove_product_from_collections = (driver) => {
  return async (product, collections_handles) => {

    await driver.products._col.updateOne(
      handle_or_id(product),
      { $pullAll: { collections: collections_handles } }
    );

  }
}

/**
 * For now and because each product is related to very few
 * collections, I will not expose the query api, and use aggregate
 * instead.
 * @param {Driver} driver 
 * @returns {db_col["list_product_collections"]}
 */
const list_product_collections = (driver) => {
  return async (product) => {
    
    const r = await driver.products._col.aggregate(
      [
        { $match : handle_or_id(product) },
        { $lookup: { from: 'collections', localField: 'collections', foreignField: 'handle', as: 'collections_expanded' } } 
      ]
    ).toArray();

    let arr = r?.[0]?.['collections_expanded'];
    arr = sanitize(arr);
    return arr;
  }
}


/** 
 * @param {Driver} driver
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    add_product_to_collections: add_product_to_collections(driver),
    remove_product_from_collections: remove_product_from_collections(driver),
    list_product_collections: list_product_collections(driver),
  }
}
