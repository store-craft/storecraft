import { ID } from './utils.func.js'
import { notificationTypeSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove } from './con.shared.js'
import { assert_zod } from './middle.zod-validate.js';
import { isDef } from './utils.index.js';

/**
 * @typedef {import('../types.api.js').NotificationType} ItemType
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.notifications;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemType[] | ItemType} items
 */
export const addBulk = async (app, items) => {
  items = Array.isArray(items) ? items : [items] ;
  // validate and assign ids
  items.forEach(
    item => { 
      assert_zod(notificationTypeSchema, item);
      item.id=ID('not');
      item.search = item.search ?? [];
      isDef(item.author) && item.search.push(`author:${item.author}`)
    }
  );

  await db(app).upsertBulk(items);
  return items;
}

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
