import { assert, to_handle } from './utils.func.js'
import { customerTypeSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { isDef } from './utils.index.js';

/**
 * @typedef {import('../types.api.js').CustomerType} ItemType
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.customers;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemType} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'cus', customerTypeSchema, 
  /**
   * @param {ItemType} final 
   */
  async (final) => {
    // add to index
    isDef(final.auth_id) && final.search.push(`auth_id:${final.auth_id}`);
    isDef(final.firstname) && final.search.push(`${final.firstname}`);
    isDef(final.lastname) && final.search.push(`${final.lastname}`);
    isDef(final.email) && final.search.push(`${final.email}`);
    isDef(final.phone_number) && final.search.push(to_handle(final.phone_number, ''));
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
