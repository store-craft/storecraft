/**
 * @import { 
 *  db_storefronts as db_col, RegularGetOptions 
 * } from '@storecraft/core/database'
 * @import { StorefrontType } from '@storecraft/core/api'
 * @import { WithRelations } from './utils.types.js'
 */

import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { count_regular, expand, get_regular, list_regular, 
  remove_regular } from './con.shared.js'
import { sanitize_array, sanitize_recursively, to_objid } from './utils.funcs.js'
import { 
  add_search_terms_relation_on, create_explicit_relation, save_me 
} from './utils.relations.js';
import { report_document_media } from './con.images.js';

/**
 * @param {MongoDB} d 
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
 * @returns {db_col["list_all_storefront_products"]}
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
 * @returns {db_col["list_all_storefront_collections"]}
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
 * @returns {db_col["list_all_storefront_discounts"]}
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
 * @returns {db_col["list_all_storefront_shipping_methods"]}
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
 * @returns {db_col["list_all_storefront_posts"]}
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
 * @returns {db_col["get_default_auto_generated_storefront"]}
 */
const get_default_auto_generated_storefront = (driver) => {
  return async () => {
    /** @type {Partial<StorefrontType>[]} */
    const items = await driver.db.aggregate(
      [
        { $documents: [{}] },
        {
          $lookup: {
            from: "products",
            pipeline: [
              { $match: { active: true } },
              { $sort: { updated_at: -1} },
              { $limit: 10 },
            ],
            as: "products"
          }
        },
        {
          $lookup: {
            from: "collections",
            pipeline: [
              { $match: { active: true } },
              { $sort: { updated_at: -1} },
            ],
            as: "collections"
          }
        },
        {
          $lookup: {
            from: "discounts",
            pipeline: [
              { $match: { active: true } },
              { $sort: { updated_at: -1} },
            ],
            as: "discounts"
          }
        },
        {
          $lookup: {
            from: "shipping_methods",
            pipeline: [
              { $match: { active: true } },
              { $sort: { updated_at: -1} },
            ],
            as: "shipping_methods"
          }
        },
        {
          $lookup: {
            from: "posts",
            pipeline: [
              { $match: { active: true } },
              { $sort: { updated_at: -1} },
              { $limit: 5 },
            ],
            as: "posts"
          }
        },
        {
          $lookup: {
            from: "products",
            pipeline: [
              { $match: { active: true, tags: { $exists: true } } },
              { $project: { tags: 1 }}
            ],
            as: "all_used_products_tags"
          }
        },

      ]
    ).toArray();

    const pre_all_tags = /** @type {{tags?: string[]}[]} */(
      items[0].all_used_products_tags ?? []
    );
    const all_used_products_tags = pre_all_tags.reduce(
      (p, c) => {
        (c?.tags ?? []).forEach(
          (tag) => p.add(tag)
        );
        return p;
      }, 
      /** @type {Set<string>} */ (new Set())
    );

    /** @type {StorefrontType} */
    let sf = {
      ...items[0],
      active: true,
      created_at: new Date().toISOString(),
      handle: 'default-auto-generated-storefront',
      id: 'default',
      title: 'Default Auto Generated Storefront',
      description: 'Default Auto Generated Storefront',
      all_used_products_tags: Array.from(all_used_products_tags)
    }

    expand(
      sf.products,
      [
        'discounts', 'collections', 
        'related_products', 'variants'
      ],
    );

    sanitize_recursively(
      sf
    );

    return sf;
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
    list_all_storefront_products: list_storefront_products(driver),
    list_all_storefront_collections: list_storefront_collections(driver),
    list_all_storefront_discounts: list_storefront_discounts(driver),
    list_all_storefront_shipping_methods: list_storefront_shipping_methods(driver),
    list_all_storefront_posts: list_storefront_posts(driver),
    get_default_auto_generated_storefront: get_default_auto_generated_storefront(driver),
  }
}
