import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { expand, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, isDef, sanitize, to_objid } from './utils.funcs.js'
import { discount_to_mongo_conjunctions } from './con.discounts.utils.js'
import { query_to_mongo } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_discounts} db_col
 */

/**
 * @param {Database} d 
 * @returns {Collection<db_col["$type"]>}
 */
const col = (d) => d.collection('discounts');

/**
 * @param {Database} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    const objid = to_objid(data.id);
    const filter = { _id: objid };
    const replacement = { ...data };
    const options = { upsert: true };

    ////
    // PRODUCT --> DISCOUNTS RELATION
    ////
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

    ////
    // STOREFRONTS -> DISCOUNTS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.discounts.ids' : objid },
      { $set: { [`_relations.discounts.entries.${objid.toString()}`]: data } },
    );


    // SAVE ME

    const res = await col(driver).replaceOne(
      filter, replacement, options
    );

    return;
  }
}

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
    const objid = to_objid(id)
    const item = await col(driver).findOne(handle_or_id(id));

    ////
    // PRODUCT RELATION
    ////
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
    // STOREFRONTS --> DISCOUNTS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.discounts.ids' : objid },
      { 
        $pull: { '_relations.discounts.ids': objid, },
        $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
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
 * @param {Database} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {Database} driver 
 * @returns {db_col["list_discount_products"]}
 */
const list_discount_products = (driver) => {
  return async (handle_or_id, query) => {

    const { filter: filter_query, sort } = query_to_mongo(query);

    console.log('query', query)
    console.log('filter', JSON.stringify(filter_query, null, 2))
    console.log('sort', sort)
    console.log('expand', query?.expand)
    
    const filter = {
      $and: [
        { search: `discount:${handle_or_id}` },
      ]
    };

    // add the query filter
    isDef(filter_query) && filter.$and.push(filter_query);

    const items = await driver.products._col.find(
      filter,  {
        sort, limit: query.limit
      }
    ).toArray();

    // try expand relations, that were asked
    expand(items, query?.expand);

    return sanitize(items);
  }
}

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
    list: list(driver),
    list_discount_products: list_discount_products(driver)
  }
}
