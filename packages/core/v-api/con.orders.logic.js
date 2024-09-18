import { orderDataUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { union } from './utils.func.js';
import { isDef } from './utils.index.js';
import { App } from '../index.js';

/**
 * @typedef {import('./types.api.d.ts').OrderData} ItemType
 * @typedef {import('./types.api.d.ts').OrderDataUpsert} ItemTypeUpsert
 */

/**
 * @param {App} app
 */
export const db = app => app.db.resources.orders;

/**
 * @param {ItemTypeUpsert} data
 * 
 * 
 * @returns {string[]}
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
    data?.pricing?.total && Math.floor(data.pricing?.total),
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
 * @type {import('./types.api.d.ts').PricingData}
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
 * 
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
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
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'orders/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'orders/remove'),
    list: regular_list(app, db(app), 'orders/list'),
  }
}


