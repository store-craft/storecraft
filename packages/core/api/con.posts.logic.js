import { assert, to_handle } from './utils.func.js'
import { postTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js';
import { App } from '../index.js';

/**
 * @typedef {import('./types.api.d.ts').PostType} ItemType
 * @typedef {import('./types.api.d.ts').PostTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {App} app
 */
export const db = app => app.db.resources.posts;

/**
 * 
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'post', postTypeUpsertSchema, 
  (before) => {
    
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    }
  },
  (final) => {
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle or Values are invalid', 400
    );
    return [];
  },
  'posts/upsert'
)(item);


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'posts/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'posts/remove'),
    list: regular_list(app, db(app), 'posts/list'),
  }
}


