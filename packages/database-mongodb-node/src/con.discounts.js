import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { 
  count_regular, expand, get_bulk, get_regular, list_regular 
} from './con.shared.js'
import { 
  handle_or_id, isDef, sanitize_array, to_objid 
} from './utils.funcs.js'
import { discount_to_mongo_conjunctions } from './con.discounts.utils.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'
import { enums } from '@storecraft/core/v-api'
import { 
  add_search_terms_relation_on, delete_me, 
  remove_entry_from_all_connection_of_relation, 
  save_me, 
  update_entry_on_all_connection_of_relation 
} from './utils.relations.js'


/**
 * @typedef {import('@storecraft/core/v-database').db_discounts} db_col
 */


/**
 * @param {MongoDB} d 
 * 
 * 
 * @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) => d.collection('discounts');


/**
 * @param {MongoDB} driver 
 * 
 * 
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
          // SEARCH
          add_search_terms_relation_on(data, search_terms);

          
          ////
          // PRODUCT --> DISCOUNTS RELATION
          ////

          // first remove discount from anywhere
          await remove_entry_from_all_connection_of_relation(
            driver, 'products', 'discounts', objid, session,
            [
              `discount:${data.handle}`, `discount:${data.id}`
            ]
          );

          // now filter and update for products
          if(data.active && data.application.id===enums.DiscountApplicationEnum.Auto.id) {
            const conjunctions = discount_to_mongo_conjunctions(data);
            if(conjunctions.length) {
              await driver.resources.products._col.updateMany(
                { $and: conjunctions },
                { 
                  $set: { [`_relations.discounts.entries.${objid.toString()}`]: data },
                  $addToSet: { 
                    '_relations.discounts.ids': objid,
                    '_relations.search': { 
                      $each : [ `discount:${data.handle}`, `discount:${data.id}` ]
                    } 
                  },
                  
                },
                { session }
              );
            }
          }

          ////
          // STOREFRONTS -> DISCOUNTS RELATION
          ////
          await update_entry_on_all_connection_of_relation(
            driver, 'storefronts', 'discounts', objid, data, session
          );

          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(data, session);

          // SAVE ME

          await save_me(
            driver, 'discounts', objid, data, session
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
 * 
 * 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {

    const item = await col(driver).findOne(
      handle_or_id(id_or_handle)
    );

    if(!item) return;

    const objid = to_objid(item.id)
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {
          ////
          // PRODUCT -> DISCOUNTS RELATION
          ////
          await remove_entry_from_all_connection_of_relation(
            driver, 'products', 'discounts', objid, session,
            [
              `discount:${item.handle}`, `discount:${item.id}`
            ]
          );

          ////
          // STOREFRONTS --> DISCOUNTS RELATION
          ////
          await remove_entry_from_all_connection_of_relation(
            driver, 'storefronts', 'discounts', objid, session
          );

          // DELETE ME
          await delete_me(
            driver, 'discounts', objid, session
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
 */
const count = (driver) => count_regular(driver, col(driver));


/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_discount_products"]}
 */
const list_discount_products = (driver) => {
  return async (handle_or_id, query) => {

    const { filter: filter_query, sort, reverse_sign } = query_to_mongo(query);

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

    const items = await driver.resources.products._col.find(
      filter,  {
        sort, limit: reverse_sign==-1 ? query.limitToLast : query.limit
      }
    ).toArray();

    if(reverse_sign==-1) items.reverse();

    // try expand relations, that were asked
    expand(items, query?.expand);

    return sanitize_array(items);
  }
}

/** 
 * @param {MongoDB} driver
 * 
 * 
 * @return {db_col & { _col: ReturnType<col>}}
 */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    getBulk: get_bulk(driver, col(driver)),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver),
    list_discount_products: list_discount_products(driver)
  }
}
