import { to_handle } from './utils.func.js'
import { collectionTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('./types.api.js').CollectionType} ItemType
 * @typedef {import('./types.api.js').CollectionTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.resources.collections;

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
    app, db(app), 'col', collectionTypeUpsertSchema, 
    (before) => {
      return {
        ...before,
        handle: before.handle ?? to_handle(before.title)
      }
    },
    (final) => {
      return [];
    },'collections/upsert'
  )(item);


/**
 * @description given a collection handle and query, 
 * return products of that collection
 * 
 * 
 * @param {import("../types.public.js").App} app
 */
export const list_collection_products = (app) => 
  /**
   * 
   * @param {import('../v-database/types.public.js').HandleOrId} handle_or_id 
   * @param {import('./types.api.query.js').ApiQuery} q 
   */
  (handle_or_id, q) => {
    return db(app).list_collection_products(handle_or_id, q);
  }


/**
 * 
 * @param {import("../types.public.js").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'collections/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'collections/remove'),
    list: regular_list(app, db(app), 'collections/list'),
    list_collection_products: list_collection_products(app)
  }
}


