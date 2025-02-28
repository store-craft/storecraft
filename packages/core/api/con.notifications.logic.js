/**
 * @import { NotificationType, NotificationTypeUpsert } from './types.api.js'
 * @import { ID as IDType } from '../database/types.public.js'
 */
import { ID, apply_dates } from './utils.func.js'
import { notificationTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove } from './con.shared.js'
import { assert_zod } from './middle.zod-validate.js';
import { App } from '../index.js';

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
 * @param {NotificationTypeUpsert | NotificationTypeUpsert[]} items
 * @return {Promise<IDType[]>}
 */
async (items) => {
  
  /** @type {string[][]} */
  const search_terms = [];
  const items_with_id = (Array.isArray(items) ? items : [items]).map
  (
    (item) => { 
      assert_zod(notificationTypeUpsertSchema, item);

      const item_with_id = apply_dates(
        {
          ...item,
          id: ID('not'),
          author: item.author ? String(item.author) : 'unknown',
          search: item.search ?? []
        }
      );

      item_with_id.search.push(`author:${item_with_id.author}`);

      search_terms.push(item_with_id.search);

      return item_with_id;
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
