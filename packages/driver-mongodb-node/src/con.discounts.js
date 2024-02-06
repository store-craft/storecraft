import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { get_regular, list_regular, 
  remove_regular, upsert_regular } from './con.shared.js'
import { to_objid } from './utils.funcs.js'
import { discount_to_mongo_conjunctions } from './con.discounts.utils.js'

/**
 * @typedef {import('@storecraft/core').db_discounts} db_col
 */

/**
 * @param {Driver} d 
 * @returns {Collection<db_col["$type"]>}
 */
const col = (d) => {
  return d.collection('discounts')
}

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
    // PRODUCT RELATION
    ////

    // remove this discount reference from products
    await driver.products._col.updateMany(
      { '_relations.discounts.ids' : objid },
      { 
        $pull: { 
          '_relations.discounts.ids': objid,
          search: { $in : [ `discount:${data.handle}`, `discount:${data.id}` ] }
        },
        $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
      },
    );

    // now filter and update for products
    const conjunctions = discount_to_mongo_conjunctions(data);
    if(conjunctions.length) {
      await driver.products._col.updateMany(
        { $and: conjunctions },
        { 
          $set: { [`_relations.discounts.entries.${objid.toString()}`]: data },
          $addToSet: { '_relations.discounts.ids': objid },
          search: { $each : [`discount:${data.handle}`, `discount:${data.id}`]} 
        },
      );
    }


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
    const item = await get(driver)(id);

    ////
    // PRODUCT RELATION
    ////

    // remove this discount reference from products
    await driver.products._col.updateMany(
      { '_relations.discounts.ids' : objid },
      { 
        $pull: { 
          '_relations.discounts.ids': objid,
          search: { $in : [ `discount:${item.handle}`, `discount:${item.id}` ] }
        },
        $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
      },
    );


    ////
    // DELETE ME
    ////
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
