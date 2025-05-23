/**
 * @import { ApiQuery, PostType, PostTypeUpsert } from './types.public.js'
 */
import { assert, to_handle } from './utils.func.js'
import { postTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js';
import { App } from '../index.js';

/**
 * @param {App} app
 */
export const db = app => app.__show_me_everything.db.resources.posts;

/**
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `post`
 * @param {PostTypeUpsert} item
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
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<PostType>} query 
   */
  (query) => {
    return db(app).count(query);
  }


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
    count: count(app),
  }
}


