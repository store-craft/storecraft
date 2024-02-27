import { orderDataSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { union } from './utils.func.js';
import { isDef } from './utils.index.js';

/**
 * @typedef {import('./types.api.js').OrderData} ItemType
 * @typedef {import('./types.api.js').OrderDataUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.orders;

/**
 * @param {ItemType} data
 * @returns {string[]}
 */
const create_search_index = (data) => {
  return union(
    data?.id,
    data?.contact?.firstname?.toLowerCase(),
    data?.contact?.lastname?.toLowerCase(),
    data?.contact?.customer_id && `customer:${data?.contact?.customer_id}`,
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
    data?.line_items?.map(
      li => `li:${li.id ?? li?.data?.handle}`
    )
  );
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'order', orderDataSchema, 
  async (final) => {
    final?.search?.push(...create_search_index(final));
    return final;
  }
)(item);


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
 * @param {import('../types.database.js').ID} customer_id 
 * @param {import('./types.api.query.js').ApiQuery} q 
 */
export const list_customer_orders = async (app, customer_id, q) => {
  return db(app).list_customer_orders(customer_id, q);
}
