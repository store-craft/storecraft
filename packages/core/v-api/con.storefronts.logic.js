import { assert, to_handle } from './utils.func.js'
import { storefrontTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('./types.api.js').StorefrontType} ItemType
 * @typedef {import('./types.api.js').StorefrontTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.resources.storefronts;

/**
 * 
 * @param {import("../types.public.js").App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'sf', storefrontTypeUpsertSchema, 
  (before) => {
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    };
  },
  (final) => {
    return [];
  },
  'storefronts/upsert'
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 */
export const list_storefront_products = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_products(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 */
export const list_storefront_collections = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_collections(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 */
export const list_storefront_discounts = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_discounts(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 */
export const list_storefront_shipping_methods = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_shipping_methods(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 */
export const list_storefront_posts = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_posts(handle_or_id);
}


/**
 * 
 * @param {import("../types.public.js").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'storefronts/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'storefronts/remove'),
    list: regular_list(app, db(app), 'storefronts/list'),
    list_storefront_products: list_storefront_products(app),
    list_storefront_collections: list_storefront_collections(app),
    list_storefront_discounts: list_storefront_discounts(app),
    list_storefront_posts: list_storefront_posts(app),
    list_storefront_shipping_methods: list_storefront_shipping_methods(app),
  }
}
