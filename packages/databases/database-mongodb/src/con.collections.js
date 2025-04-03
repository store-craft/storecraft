/**
 * @import { db_collections as db_col } from '@storecraft/core/database'
 * @import { ProductType, VariantType } from '@storecraft/core/api'
 * @import { WithRelations } from './utils.types.js'
 * @import { Filter } from 'mongodb'
 */

import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { count_regular, expand, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, isDef, sanitize_array, to_objid } from './utils.funcs.js'
import { query_to_mongo } from './utils.query.js'
import { report_document_media } from './con.images.js'
import { 
  add_search_terms_relation_on, delete_me, 
  remove_entry_from_all_connection_of_relation, 
  save_me, 
  update_entry_on_all_connection_of_relation 
} from './utils.relations.js'


const transactionOptions = {
  readPreference: 'primary',
  readConcern: { level: 'local' },
  writeConcern: { w: 'majority' }
};

/**
 * @param {MongoDB} d 
 * @returns {Collection<WithRelations<db_col["$type_get"]>>}
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
          // SEARCH
          add_search_terms_relation_on(data, search_terms);

          ////
          // PRODUCT -> COLLECTION RELATION
          ////
          // update collection document in products, that reference this collection
          await update_entry_on_all_connection_of_relation(
            driver, 'products', 'collections', objid, data, session
          );

          ////
          // STOREFRONTS -> COLLECTIONS RELATION
          ////
          await update_entry_on_all_connection_of_relation(
            driver, 'storefronts', 'collections', objid, data, session
          );

          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(data, session);

          // SAVE ME
          await save_me(
            driver, 'collections', objid, data, session
          );

        // @ts-ignore
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

    const objid = to_objid(item.id);
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          ////
          // PRODUCTS --> COLLECTIONS RELATION
          ////
          await remove_entry_from_all_connection_of_relation(
            driver, 'products', 'collections', objid, session,
            [
              `col:${item.id}`, `col:${item.handle}`
            ]
          );

          ////
          // STOREFRONTS --> COLLECTIONS RELATION
          ////
          await remove_entry_from_all_connection_of_relation(
            driver, 'storefronts', 'collections', objid, session
          );

          // DELETE ME
          await delete_me(
            driver, 'collections', objid, session
          );

        // @ts-ignore
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
 */
const count = (driver) => count_regular(driver, col(driver));


/**
 * @param {MongoDB} driver 
 * @returns {db_col["list_collection_products"]}
 */
const list_collection_products = (driver) => {
  return async (handle_or_id, query) => {

    const { 
      filter: filter_query, sort, reverse_sign 
    } = query_to_mongo(query);

    // console.log('query', query)
    // console.log('filter', JSON.stringify(filter_query, null, 2))
    // console.log('sort', sort)
    // console.log('expand', query?.expand)
    
    /**
     * @type {Filter<WithRelations<ProductType | VariantType>>
     * }
     */
    const filter = {
      $and: [
        { '_relations.search': `col:${handle_or_id}` },
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
 * @returns {db_col["count_collection_products"]}
 */
const count_collection_products = (driver) => {
  return async (handle_or_id, query) => {

    const { 
      filter: filter_query, sort, reverse_sign 
    } = query_to_mongo(query);

    /**
     * @type {Filter<WithRelations<ProductType | VariantType>>
     * }
     */
    const filter = {
      $and: [
        { '_relations.search': `col:${handle_or_id}` },
      ]
    };

    // add the query filter
    isDef(filter_query) && filter.$and.push(filter_query);

    const count = await driver.resources.products._col.countDocuments(
      filter
    );

    return count;
  }
}



/**
 * @param {MongoDB} driver 
 * @returns {db_col["list_used_products_tags"]}
 */
const list_used_products_tags = (driver) => {
  return async (handle_or_id) => {
    const items = await driver.resources.products._col.find(
      {
        '_relations.search': `col:${handle_or_id}`
      },
      {
        projection: {
          tags: 1
        }
      }
    ).toArray();

    const set = (items ?? []).reduce(
      (p, c) => {
        c.tags.forEach(
          (tag) => p.add(tag)
        );
        return p;
      }, new Set()
    )
    // return array from set
    return Array.from(set);
  }
}


/** 
 * @param {MongoDB} driver
 * 
 * 
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    count: count(driver),
    list_collection_products: list_collection_products(driver),
    count_collection_products: count_collection_products(driver),
    list_used_products_tags: list_used_products_tags(driver),
  }
}
