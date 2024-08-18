import { assert, to_handle, union } from './utils.func.js'
import { discountTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { isDef } from './utils.index.js';

/**
 * @typedef {import('./types.api.d.ts').DiscountType} ItemType
 * @typedef {import('./types.api.d.ts').DiscountTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.resources.discounts;

/**
 * 
 * @param {import("../types.public.js").App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'dis', discountTypeUpsertSchema, 
  (before) => {
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    }
  },
  (final) => {
    return union(
      isDef(final?.application) && `app:${final.application.id}`,
      isDef(final?.application?.name) && `app:${final.application.name.toLowerCase()}`,
      isDef(final?.info?.details?.meta) && `type:${final.info.details.meta.id}`,
      isDef(final?.info?.details?.meta) && `type:${final.info.details.meta.type}`,
    );
  },
  'discounts/upsert'
)(item);


/**
 * given a discount handle and query, return products of that discount
 * 
 * 
 * @param {import("../types.public.js").App} app
 */
export const list_discounts_products = (app) => 
/**
 * 
 * @param {import('../v-database/types.public.d.ts').HandleOrId} handle_or_id 
 * @param {import('./types.api.query.d.ts').ApiQuery} [q] 
 */
(handle_or_id, q) => {
  return db(app).list_discount_products(handle_or_id, q);
}


/**
 * 
 * @param {import("../types.public.js").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'discounts/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'discounts/remove'),
    list: regular_list(app, db(app), 'discounts/list'),
    list_discounts_products: list_discounts_products(app)
  }
}
