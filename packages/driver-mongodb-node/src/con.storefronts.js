import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js'
import { create_explicit_relation } from './utils.relations.js';

/**
 * @typedef {import('@storecraft/core').db_storefronts} db_col
 */

/**
 * @param {Driver} d 
 * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type"]>>}
 */
const col = (d) => d.collection('storefronts');

/**
 * @param {Driver} driver 
 * @return {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    
    const filter = { _id: to_objid(data.id) };
    const options = { upsert: true };

    ////
    // PRODUCTS/COLLECTIONS/DISCOUNTS/SHIPPING/POSTS RELATIONS (explicit)
    ////
    const replacement = await create_explicit_relation(
      driver, data, 'products', 'products', false
    );
    await create_explicit_relation(
      driver, replacement, 'collections', 'collections', false
    );
    await create_explicit_relation(
      driver, replacement, 'discounts', 'discounts', false
    );
    await create_explicit_relation(
      driver, replacement, 'shipping_methods', 'shipping_methods', false
    );
    await create_explicit_relation(
      driver, replacement, 'posts', 'posts', false
    );
    
    // SAVE ME
    const res = await col(driver).replaceOne(
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
