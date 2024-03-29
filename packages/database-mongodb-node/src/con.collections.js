import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { expand, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, isDef, sanitize_array, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'
import { add_search_terms_relation_on } from './utils.relations.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_collections} db_col
 */


const transactionOptions = {
  readPreference: 'primary',
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority' }
};

/**
 * @param {MongoDB} d 
 * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type_get"]>>}
 */
const col = (d) => d.collection('collections');

/**
 * @param {MongoDB} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data, search_terms=[]) => {
    data = {...data};
    const objid = to_objid(data.id)
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          ////
          // PRODUCT -> COLLECTION RELATION
          ////
          // update collection document in products, that reference this collection
          await driver.products._col.updateMany(
            { '_relations.collections.ids' : objid },
            { 
              $set: { [`_relations.collections.entries.${objid.toString()}`]: data },
            },
            { session }
          );

          ////
          // STOREFRONTS -> COLLECTIONS RELATION
          ////
          await driver.storefronts._col.updateMany(
            { '_relations.collections.ids' : objid },
            { $set: { [`_relations.collections.entries.${objid.toString()}`]: data } },
            { session }
          );

          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(data, session);

          // SEARCH
          add_search_terms_relation_on(data, search_terms);

          // SAVE ME
          const res = await col(driver).replaceOne(
            { _id: objid }, data, { upsert: true, session }
          );

        }, transactionOptions
      );
    
    } catch(e) {
      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }

}

/**
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    const item = await col(driver).findOne(handle_or_id(id_or_handle));
    if(!item) return;
    const objid = to_objid(item.id);
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          ////
          // PRODUCTS --> COLLECTIONS RELATION
          ////
          const rr = await driver.products._col.updateMany(
            { '_relations.collections.ids' : objid },
            { 
              $pull: { 
                '_relations.collections.ids': objid,
                '_relations.search': { $in : [ `col:${item.id}`, `col:${item.handle}` ] }
              },
              $unset: { [`_relations.collections.entries.${objid.toString()}`]: '' },
            },
            { upsert: false, session }
          );

          // console.log(objid)
          // console.log(rr)

          ////
          // STOREFRONTS --> COLLECTIONS RELATION
          ////
          await driver.storefronts._col.updateMany(
            { '_relations.collections.ids' : objid },
            { 
              $pull: { '_relations.collections.ids': objid, },
              $unset: { [`_relations.collections.entries.${objid.toString()}`]: '' },
            },
            { session }
          );

          // DELETE ME
          const res = await col(driver).deleteOne(
            { _id: objid },
            { session }
          );

        }, transactionOptions
      );
    } catch(e) {
      console.log(e);
      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }

}


/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * @returns {db_col["list_collection_products"]}
 */
const list_collection_products = (driver) => {
  return async (handle_or_id, query) => {

    const { filter: filter_query, sort } = query_to_mongo(query);

    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter_query, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)
    
    const filter = {
      $and: [
        { '_relations.search': `col:${handle_or_id}` },
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

    return sanitize_array(items);
  }
}

/** 
 * @param {MongoDB} driver
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
