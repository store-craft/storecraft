import { assert, to_handle } from './utils.func.js'
import { discountTypeSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { isDef } from './utils.index.js';

/**
 * @typedef {import('../types.api.js').DiscountType} ItemType
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.discounts;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemType} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'dis', discountTypeSchema, 
  /**
   * @param {ItemType} final 
   */
  async (final) => {
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle or Values are invalid', 400
    );

    isDef(final.application) && final.search.push(
      `app:${final.application.id}`, 
      `app:${final.application.name.toLowerCase()}`, 
      );

    isDef(final.info?.details?.meta) && final.search.push(
      `type:${final.info?.details?.meta?.id}`, 
      `type:${final.info?.details?.meta?.type}`, 
      );

    return final;
  }
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 * @param {import('../types.driver.js').RegularGetOptions} [options]
 */
export const get = (app, handle_or_id, options) => regular_get(app, db(app))(handle_or_id, options);

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
