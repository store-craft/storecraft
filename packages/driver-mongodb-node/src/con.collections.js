import { Collection } from 'mongodb'
import { Driver } from '../driver.js'
import { expand, get_regular, list_regular } from './con.shared.js'
import { isDef, sanitize, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'

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
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    
    const objid = to_objid(data.id)
    const filter = { _id: objid };
    const replacement = { ...data };
    const options = { upsert: true };

    // update collection document in products, that reference this collection
    await driver.products._col.updateMany(
      { '_relations.collections.ids' : objid },
      { 
        $set: { [`_relations.collections.entries.${objid.toString()}`]: data },
      },
    );

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

    const item = await get(driver)(id);
    if(!item)
      return;

    const objid = to_objid(item.id);

    // todo: transaction

    // remove collection reference from products
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

    // delete me
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
 * @returns {db_col["list_products"]}
 */
const list_products = (driver) => {
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

    const items = await col(driver).find(
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
    list_products: list_products(driver) 
  }
}
