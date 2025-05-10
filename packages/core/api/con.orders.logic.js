/**
 * @import { ApiQuery, OrderData, OrderDataUpsert, PricingData } from './types.public.js'
 */
import { orderDataUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { union } from './utils.func.js';
import { isDef } from './utils.index.js';
import { App } from '../index.js';

/**
 * @param {App} app
 */
export const db = app => app.__show_me_everything.db.resources.orders;

/**
 * @description create search index for order
 * @param {OrderDataUpsert} data
 */
const create_search_index = (data) => {
  return union(
    data?.id,
    data?.contact?.firstname?.toLowerCase(),
    data?.contact?.lastname?.toLowerCase(),
    data?.contact?.customer_id && `customer:${data?.contact?.customer_id}`,
    data?.contact?.email && `customer:${data?.contact?.email}`,
    data?.contact?.customer_id,
    data?.contact?.email,
    data?.pricing?.total && String(Math.floor(data.pricing?.total)),
    data?.status?.payment?.name2 && `payment:${data.status.payment.name2}`,
    isDef(data?.status?.payment?.id) && `payment:${data.status.payment.id}`,
    data?.status?.fulfillment?.name2 && `fulfill:${data.status.fulfillment.name2}`,
    isDef(data?.status?.fulfillment?.id) && `fulfill:${data.status.fulfillment.id}`,
    data?.status?.checkout?.name2 && `checkout:${data.status.checkout.name2}`,
    isDef(data?.status?.checkout?.id) && `checkout:${data.status.checkout.id}`,
    data?.pricing?.evo?.slice(1)?.filter(
      e => e.total_discount>0
    ).map(e => `discount:${e.discount_code}`),
    data?.line_items?.map(li => li.id).filter(Boolean).map(id => `li:${id}`),
    data?.line_items?.map(li => li.data?.handle).filter(Boolean).map(h => `li:${h}`),
  );
}


/**
 * @type {PricingData}
 */
const default_pricing = {
  quantity_discounted: 0,
  quantity_total: 0,
  subtotal: 0,
  subtotal_discount: 0,
  subtotal_undiscounted: 0,
  total: 0,
  total_without_taxes: 0
}

/**
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `order`
 * @param {OrderDataUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'order', orderDataUpsertSchema, 
  (before) => {
    
    return {
      ...before,
      pricing: before.pricing ?? default_pricing
    }
  },
  (final) => {
    return create_search_index(final);
  },
  'orders/upsert'
)(item);


/**
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<OrderData>} query 
   */
  (query) => {
    return db(app).count(query);
  }


/**
 * @param {App} app
 */
export const list_my_orders = (app) => 
  /**
   * @description query orders of a user
   * @param {string} id_or_email 
   * @param {ApiQuery<OrderData>} [query={}] 
   */
  (id_or_email, query={}) => {
    return app.api.customers.list_customer_orders(
      id_or_email, query
    );
  }


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'orders/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'orders/remove'),
    list: regular_list(app, db(app), 'orders/list'),
    list_my_orders: list_my_orders(app),
    count: count(app),
  }
}


