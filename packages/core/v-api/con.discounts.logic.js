import { assert, to_handle, union } from './utils.func.js'
import { discountTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { isDef } from './utils.index.js';

/**
 * @typedef {import('./types.api.js').DiscountType} ItemType
 * @typedef {import('./types.api.js').DiscountTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.discounts;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'dis', discountTypeUpsertSchema, 
  (final) => {
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle or Values are invalid', 400
    );

    return union(
      isDef(final.application) && `app:${final.application.id}`,
      isDef(final.application) && `app:${final.application.name.toLowerCase()}`,
      isDef(final.info?.details?.meta) && `type:${final.info.details.meta.id}`,
      isDef(final.info?.details?.meta) && `type:${final.info.details.meta.type}`,
    );
  }
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 * @param {import('../v-database/types.public.js').RegularGetOptions} [options]
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
 * @param {import('./types.api.query.js').ApiQuery} q
 */
export const list = (app, q) => regular_list(app, db(app))(q);

/**
 * given a discount handle and query, return products of that discount
 * @param {import("../types.public.js").App} app
 * @param {import('../v-database/types.public.js').HandleOrId} handle_or_id 
 * @param {import('./types.api.query.js').ApiQuery} [q] 
 */
export const list_discounts_products = async (app, handle_or_id, q) => {
  return db(app).list_discount_products(handle_or_id, q);
}
