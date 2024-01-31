import { assert, to_handle, union } from './utils.func.js'
import { collectionTypeSchema, productTypeSchema, tagTypeSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('../types.api.js').ProductType} ItemType
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.products;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemType} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'pr', productTypeSchema, 
  /**
   * @param {ItemType} final 
   */
  async (final) => {
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle is invalid', 400
    );
    final.search.push(
      ...union(
        final.collections?.map(c => `col:${c}`)
      )
    );
    
    return final;
  }
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 */
export const get = (app, handle_or_id) => regular_get(app, db(app))(handle_or_id);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} id
 */
export const remove = (app, id) => regular_remove(app, db(app))(id);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {import('../types.api.query.js').ParsedApiQuery} q
 */
export const list = (app, q) => regular_list(app, db(app))(q);
