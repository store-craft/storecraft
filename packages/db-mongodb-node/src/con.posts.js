import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js';

/**
 * @typedef {import('@storecraft/core').db_posts} db_col
 */

/**
 * @param {Driver} d 
 * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type"]>>}
 */
const col = (d) => d.collection('posts');

/**
 * @param {Driver} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    const objid = to_objid(data.id);
    const filter = { _id: objid };
    const replacement = { ...data };
    const options = { upsert: true };

    ////
    // STOREFRONTS --> POSTS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.posts.ids' : objid },
      { $set: { [`_relations.posts.entries.${objid.toString()}`]: data } },
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
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const objid = to_objid(id)
    // const item = await col(driver).findOne(handle_or_id(id));

    ////
    // STOREFRONTS --> POSTS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.posts.ids' : objid },
      { 
        $pull: { '_relations.posts.ids': objid, },
        $unset: { [`_relations.posts.entries.${objid.toString()}`]: '' },
      },
    );

    // DELETE ME
    const res = await col(driver).findOneAndDelete( 
      { _id: objid }
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
  driver
  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
