import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { get_regular, list_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js';
import { report_document_media } from './con.images.js';
import { add_search_terms_relation_on } from './utils.relations.js';

/**
 * @typedef {import('@storecraft/core/v-database').db_shipping} db_col
 */

/**
 * @param {MongoDB} d 
 * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type_get"]>>}
 */
const col = (d) => d.collection('shipping_methods');

/**
 * @param {MongoDB} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data, search_terms=[]) => {
    data = {...data};
    const objid = to_objid(data.id);
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {
          ////
          // STOREFRONTS --> SHIPPING RELATION
          ////
          await driver.storefronts._col.updateMany(
            { '_relations.shipping_methods.ids' : objid },
            { $set: { [`_relations.shipping_methods.entries.${objid.toString()}`]: data } },
            { session }
          );

          // console.log('search_terms', search_terms)
          // SEARCH
          add_search_terms_relation_on(data, search_terms);

          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(data, session);

          // SAVE ME
          const res = await col(driver).replaceOne(
            { _id: objid }, 
            data, 
            { session, upsert: true }
          );

        }
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
          // STOREFRONTS --> SHIPPING RELATION
          ////
          await driver.storefronts._col.updateMany(
            { '_relations.shipping_methods.ids' : objid },
            { 
              $pull: { '_relations.shipping_methods.ids': objid },
              $unset: { [`_relations.shipping_methods.entries.${objid.toString()}`]: '' },
            },
            { session }
          );

          // DELETE ME
          const res = await col(driver).deleteOne( 
            { _id: objid }, 
            { session }
          );
        }
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
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {
  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver)
  }
}
