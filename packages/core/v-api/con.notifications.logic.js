import { ID, apply_dates } from './utils.func.js'
import { notificationTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove } from './con.shared.js'
import { assert_zod } from './middle.zod-validate.js';
import { isDef } from './utils.index.js';
import { App } from '../index.js';

/**
 * @typedef {import('./types.api.d.ts').NotificationType} ItemType
 * @typedef {import('./types.api.d.ts').NotificationTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {App} app
 */
export const db = app => app.db.resources.notifications;

/**
 * 
 * @param {App} app
 */
export const addBulk = (app) => 
/**
 * 
 * @param {ItemTypeUpsert[]} items
 * @return {Promise<import('../v-database/types.public.d.ts').ID[]>}
 */
async (items) => {
  
  /** @type {(ItemTypeUpsert & import('../v-database/types.public.d.ts').idable_concrete)[]} */
  const items_with_id = Array.isArray(items) ? items : [items] ;
  // validate and assign ids
  /** @type {string[][]} */
  const search_terms = [];
  items_with_id.forEach(
    item => { 
      assert_zod(notificationTypeUpsertSchema, item);

      item.id = ID('not');
      item.search = item.search ?? [];

      apply_dates(item);
      
      isDef(item.author) && item.search.push(`author:${item.author}`);

      search_terms.push(item.search)
    }
  );

  await db(app).upsertBulk(items_with_id, search_terms);
  
  return items_with_id.map(it => it.id);
}


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app)),
    remove: regular_remove(app, db(app)),
    list: regular_list(app, db(app)),
    addBulk: addBulk(app)
  }
}
