import { ID, apply_dates } from './utils.func.js'
import { notificationTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove } from './con.shared.js'
import { assert_zod } from './middle.zod-validate.js';
import { isDef } from './utils.index.js';

/**
 * @typedef {import('./types.api.js').NotificationType} ItemType
 * @typedef {import('./types.api.js').NotificationTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.notifications;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert[]} items
 * @return {Promise<import('../types.database.js').ID[]>}
 */
export const addBulk = async (app, items) => {
  
  items = Array.isArray(items) ? items : [items] ;
  // validate and assign ids
  items.forEach(
    item => { 
      assert_zod(notificationTypeUpsertSchema, item);
      item.id = ID('not');
      item.search = item.search ?? [];
      apply_dates(item);
      isDef(item.author) && item.search.push(`author:${item.author}`)
    }
  );

  await db(app).upsertBulk(items);
  return items.map(it => it.id);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} id
 * @param {import('../types.database.js').RegularGetOptions} [options]
 */
export const get = (app, id, options) => regular_get(app, db(app))(id, options);

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
