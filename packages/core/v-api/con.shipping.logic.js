import { shippingMethodTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { to_handle } from './utils.func.js';

/**
 * @typedef {import('./types.api.d.ts').ShippingMethodType} ItemType
 * @typedef {import('./types.api.d.ts').ShippingMethodTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.d.ts").App} app
 */
export const db = app => app.db.resources.shipping_methods;

/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'ship', shippingMethodTypeUpsertSchema, 
  (before) => {
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    }
  },
  (final) => {
    return [];
  },
  'shipping/upsert'
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'shipping/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'shipping/remove'),
    list: regular_list(app, db(app), 'shipping/list'),
  }
}
