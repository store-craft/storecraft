import { Collection } from '../data-api-client/index.js'
import { MongoDB } from '../driver.js'
import { expand, get_bulk, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, isDef, sanitize_array, to_objid } from './utils.funcs.js'
import { discount_to_mongo_conjunctions } from './con.discounts.utils.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'
import { DiscountApplicationEnum } from '@storecraft/core/v-api'
import { add_search_terms_relation_on } from './utils.relations.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_discounts} db_col
 */

/**
 * @param {MongoDB} d 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('discounts');

/**
 * @param {MongoDB} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data, search_terms=[]) => {
    data = {...data};
    const objid = to_objid(data.id);

    try {
      ////
      // PRODUCT --> DISCOUNTS RELATION
      ////

      // first remove discount from anywhere
      await driver.products._col.updateMany(
        { '_relations.discounts.ids' : objid },
        { 
          $pull: { 
            '_relations.discounts.ids': objid,
            '_relations.search': { $in : [ `discount:${data.handle}`, `discount:${data.id}` ] }
          },
          $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
        },
        false
      );

      // now filter and update for products
      if(data.active && data.application.id===DiscountApplicationEnum.Auto.id) {
        const conjunctions = discount_to_mongo_conjunctions(data);
        if(conjunctions.length) {
          await driver.products._col.updateMany(
            { $and: conjunctions },
            { 
              $set: { [`_relations.discounts.entries.${objid.toString()}`]: data },
              $addToSet: { 
                '_relations.discounts.ids': objid,
                '_relations.search': { $each : [`discount:${data.handle}`, `discount:${data.id}`]} 
              },
              
            },
            false
          );
        }
      }

      ////
      // STOREFRONTS -> DISCOUNTS RELATION
      ////
      await driver.storefronts._col.updateMany(
        { '_relations.discounts.ids' : objid },
        { $set: { [`_relations.discounts.entries.${objid.toString()}`]: data } },
        false
      );

      // SEARCH
      add_search_terms_relation_on(data, search_terms);

      ////
      // REPORT IMAGES USAGE
      ////
      await report_document_media(driver)(data);

      // SAVE ME

      const res = await col(driver).updateOne(
        { _id: objid }, {...data}, 
        true
      );
    } catch(e) {
      console.log(e);
      return false;
    } finally {
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
    const objid = to_objid(item.id)

    try {
      ////
      // PRODUCT RELATION
      ////
      await driver.products._col.updateMany(
        { '_relations.discounts.ids' : objid },
        { 
          $pull: { 
            '_relations.discounts.ids': objid,
            '_relations.search': { $in : [ `discount:${item.handle}`, `discount:${item.id}` ] }
          },
          $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
        },
        false
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
        false
      );

      // DELETE ME
      const res = await col(driver).deleteOne( 
        { _id: objid },
      );

    } catch(e) {
      console.log(e);
      return false;
    } finally {
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
 * @returns {db_col["list_discount_products"]}
 */
const list_discount_products = (driver) => {
  return async (handle_or_id, query) => {

    const { filter: filter_query, sort } = query_to_mongo(query);

    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter_query, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)
    
    const filter = {
      $and: [
        { '_relations.search': `discount:${handle_or_id}` },
      ]
    };

    // add the query filter
    isDef(filter_query) && filter.$and.push(filter_query);

    const items = await driver.products._col.find(
      filter, sort, query.limit
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
  driver
  return {
    _col: col(driver),
    get: get(driver),
    getBulk: get_bulk(driver, col(driver)),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_discount_products: list_discount_products(driver)
  }
}
