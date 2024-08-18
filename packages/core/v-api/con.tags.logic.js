import { assert, to_handle } from './utils.func.js'
import { tagTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('./types.api.d.ts').TagType} ItemType
 * @typedef {import('./types.api.d.ts').TagTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.d.ts").App} app
 */
export const db = app => app.db.resources.tags;

/**
 * 
 * @param {import("../types.public.d.ts").App} app
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
  },
  'tags/upsert'
)(item);


/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'tags/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'tags/remove'),
    list: regular_list(app, db(app), 'tags/list'),
  }
}
