import { assert, to_handle } from './utils.func.js'
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
export const db = app => app.db.collections;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'col', collectionTypeUpsertSchema, 
  (final) => {
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle is invalid', 400
    );
    return [];
  }
)(item);


/**
 * given a collection handle and query, return products of that collection
 * @param {import("../types.public.js").App} app
 * @param {import('../v-database/types.public.js').HandleOrId} handle_or_id 
 * @param {import('./types.api.query.js').ApiQuery} q 
 */
export const list_collection_products = async (app, handle_or_id, q) => {
  return db(app).list_collection_products(handle_or_id, q);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 * @param {import('../v-database/types.public.js').RegularGetOptions} [options]
 */
export const get = (app, handle_or_id, options) => regular_get(app, db(app))(handle_or_id, options);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} id
 */
export const remove = (app, id) => regular_remove(app, db(app))(id);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {import('./types.api.query.js').ApiQuery} q
 */
export const list = (app, q) => regular_list(app, db(app))(q);
