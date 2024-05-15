import { assert, to_handle } from './utils.func.js'
import { tagTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('./types.api.js').TagType} ItemType
 * @typedef {import('./types.api.js').TagTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.resources.tags;

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
  app, db(app), 'tag', tagTypeUpsertSchema, 
  (before) => before,
  (final) => {
    
    assert(
      [final.handle, ...final.values].every(Boolean),
      'Handle or Values are missing', 400
    );

    final.handle = to_handle(final.handle);
    final.values = final.values.map(
      v => to_handle(v)
    );

    return final.values ?? [];
  }
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app)),
    upsert: upsert(app),
    remove: regular_remove(app, db(app)),
    list: regular_list(app, db(app)),
  }
}
