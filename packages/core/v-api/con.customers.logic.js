import { ID, apply_dates, assert, to_handle } from './utils.func.js'
import { customerTypeSchema, customerTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { create_search_index, isDef } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';

/**
 * @typedef {import('./types.api.js').CustomerType} ItemType
 * @typedef {import('./types.api.js').CustomerTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.customers;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = async (app, item) => {
  assert_zod(customerTypeUpsertSchema, item);

  // Check if exists
  const item_get = await db(app).getByEmail(item.email);
  if(item_get) {
    assert(item_get.id===item.id, `ids incompatible`, 401);
  }
  const id = !Boolean(item.id) ? ID('cus') : item.id;
  // search index
  let search = create_search_index({ ...item, id });
  isDef(item.auth_id) && search.push(`auth_id:${item.auth_id}`);
  isDef(item.firstname) && search.push(`${item.firstname}`);
  isDef(item.lastname) && search.push(`${item.lastname}`);
  isDef(item.email) && search.push(`${item.email}`);
  isDef(item.phone_number) && search.push(to_handle(item.phone_number, ''));
  
  // apply dates and index
  const final = apply_dates(
    { 
      ...item, id, search
    }
  );

  const succeed = await db(app).upsert(final);
  assert(succeed, 'failed', 401);
  return id;
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
 * @param {string} email
 * @param {import('../types.database.js').RegularGetOptions} [options]
 */
export const getByEmail = async (app, email, options) => {
  return db(app).getByEmail(email);
};

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} id_or_email
 */
export const remove = (app, id_or_email) => regular_remove(app, db(app))(id_or_email);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {import('./types.api.query.js').ApiQuery} q
 */
export const list = (app, q) => regular_list(app, db(app))(q);
