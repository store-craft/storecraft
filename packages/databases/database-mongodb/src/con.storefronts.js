/**
 * @import { 
 *  db_storefronts as db_col, RegularGetOptions 
 * } from '@storecraft/core/database'
 * @import { WithRelations } from './utils.relations.js'
 */

import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { count_regular, get_regular, list_regular, 
  remove_regular } from './con.shared.js'
import { sanitize_array, to_objid } from './utils.funcs.js'
import { 
  add_search_terms_relation_on, create_explicit_relation, save_me 
} from './utils.relations.js';
import { report_document_media } from './con.images.js';

/**
 * @param {MongoDB} d 
 * 
 * @returns {Collection<WithRelations<db_col["$type_get"]>>}
 */
const col = (d) => d.collection('storefronts');

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @return {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data, search_terms=[]) => {
    data = {...data};

    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {
          ////
          // PRODUCTS/COLLECTIONS/DISCOUNTS/SHIPPING/POSTS RELATIONS (explicit)
          ////
          let replacement = await create_explicit_relation(
            driver, data, 'products', 'products', true
          );
          replacement = await create_explicit_relation(
            driver, replacement, 'collections', 'collections', true
          );
          replacement = await create_explicit_relation(
            driver, replacement, 'discounts', 'discounts', true
          );
          replacement = await create_explicit_relation(
            driver, replacement, 'shipping_methods', 'shipping_methods', true
          );
          replacement = await create_explicit_relation(
            driver, replacement, 'posts', 'posts', true
          );

          // SEARCH
          add_search_terms_relation_on(replacement, search_terms);

          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(replacement, session);
          
          // SAVE ME
          await save_me(
            driver, 'storefronts', to_objid(data.id), replacement, session
          );

        }
      );
    } catch (e) {
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
 */
const remove = (driver) => remove_regular(driver, col(driver));

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
 * @returns {db_col["list_storefront_products"]}
 */
const list_storefront_products = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['products']
    };

    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.products ?? []);
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_storefront_collections"]}
 */
const list_storefront_collections = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['collections']
    };

    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.collections ?? []);
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_storefront_discounts"]}
 */
const list_storefront_discounts = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['discounts']
    };

    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.discounts ?? []);
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * @returns {db_col["list_storefront_shipping_methods"]}
 */
const list_storefront_shipping_methods = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['shipping_methods']
    };

    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.shipping_methods ?? []);
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_storefront_posts"]}
 */
const list_storefront_posts = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['posts']
    };

    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.posts ?? []);
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
    list_storefront_products: list_storefront_products(driver),
    list_storefront_collections: list_storefront_collections(driver),
    list_storefront_discounts: list_storefront_discounts(driver),
    list_storefront_shipping_methods: list_storefront_shipping_methods(driver),
    list_storefront_posts: list_storefront_posts(driver),
  }
}
