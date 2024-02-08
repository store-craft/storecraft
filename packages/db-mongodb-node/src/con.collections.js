import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { expand, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, isDef, sanitize, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_collections} db_col
 */

/**
 * @param {Database} d 
 * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type"]>>}
 */
const col = (d) => d.collection('collections');

/**
 * @param {Database} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    
    const objid = to_objid(data.id)
    const filter = { _id: objid };
    const options = { upsert: true };

    ////
    // PRODUCT -> COLLECTION RELATION
    ////
    // update collection document in products, that reference this collection
    await driver.products._col.updateMany(
      { '_relations.collections.ids' : objid },
      { 
        $set: { [`_relations.collections.entries.${objid.toString()}`]: data },
      },
    );

    ////
    // STOREFRONTS -> COLLECTIONS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.collections.ids' : objid },
      { $set: { [`_relations.collections.entries.${objid.toString()}`]: data } },
    );

    // SAVE ME
    const res = await col(driver).replaceOne(
      filter, data, options
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

    const item = await col(driver).findOne(handle_or_id(id));
    if(!item)
      return;

    const objid = to_objid(item.id);

    // todo: transaction

    ////
    // PRODUCTS --> COLLECTIONS RELATION
    ////
    await driver.products._col.updateMany(
      { '_relations.collections.ids' : objid },
      { 
        $pull: { 
          '_relations.collections.ids': objid,
          search: { $in : [ `col:${item.id}`, `col:${item.handle}` ] }
        },
        $unset: { [`_relations.collections.entries.${objid.toString()}`]: '' },
      },
    );

    ////
    // STOREFRONTS --> COLLECTIONS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.collections.ids' : objid },
      { 
        $pull: { '_relations.collections.ids': objid, },
        $unset: { [`_relations.collections.entries.${objid.toString()}`]: '' },
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
 * @returns {db_col["list_collection_products"]}
 */
const list_collection_products = (driver) => {
  return async (handle_or_id, query) => {

    const { filter: filter_query, sort } = query_to_mongo(query);

    console.log('query', query)
    console.log('filter', JSON.stringify(filter_query, null, 2))
    console.log('sort', sort)
    console.log('expand', query?.expand)
    
    const filter = {
      $and: [
        { search: `col:${handle_or_id}` },
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

  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_collection_products: list_collection_products(driver) 
  }
}
