import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js';

/**
 * @typedef {import('@storecraft/core').db_images} db_col
 */

/**
 * @param {Database} d @returns {Collection<db_col["$type"]>}
 */
const col = (d) =>  d.collection('images');

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
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const image = await col(driver).findOne(handle_or_id(id));

    ////
    // EVERYTHING --> IMAGES URL
    ////
    const filter = { media : image.url };
    const update = { $pull: { media: image.url } };

    await Promise.all(
      [
        driver.collections._col.updateMany(filter, update),
        driver.discounts._col.updateMany(filter, update),
        driver.posts._col.updateMany(filter, update),
        driver.products._col.updateMany(filter, update),
        driver.shipping._col.updateMany(filter, update),
        driver.storefronts._col.updateMany(filter, update),
      ]
    );

    // DELETE ME
    const res = await col(driver).findOneAndDelete( 
      { _id: image._id }
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
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
