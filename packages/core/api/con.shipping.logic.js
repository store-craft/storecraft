/**
 * @import { ApiQuery, ShippingMethodType, ShippingMethodTypeUpsert } from './types.public.js'
 */
import { shippingMethodTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert 
} from './con.shared.js'
import { to_handle } from './utils.func.js';
import { App } from '../index.js';

/** @param {App} app */
export const db = app => app.db.resources.shipping_methods;

/**
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `shipping method`
 * @param {ShippingMethodTypeUpsert} item
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
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * @param {ApiQuery<ShippingMethodType>} query 
   */
  (query) => {
    return db(app).count(query);
  }


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'shipping/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'shipping/remove'),
    list: regular_list(app, db(app), 'shipping/list'),
    count: count(app)
  }
}
