import { orderDataSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { union } from './utils.func.js';

/**
 * @typedef {import('../types.api.js').OrderData} ItemType
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
    data?.contact?.customer_id && `customer_id:${data?.contact?.customer_id}`,
    data?.contact?.customer_id,
    data?.contact?.email,
    data?.pricing?.total && Math.floor(data.pricing?.total),
    data?.status?.payment?.name2 && `payment:${data.status.payment.name2}`,
    data?.status?.payment?.id && `payment:${data.status.payment.id}`,
    data?.status?.fulfillment?.name2 && `fulfill:${data.status.fulfillment.name2}`,
    data?.status?.fulfillment?.id && `fulfill:${data.status.fulfillment.id}`,
    data?.status?.checkout?.name2 && `checkout:${data.status.checkout.name2}`,
    data?.status?.checkout?.id && `checkout:${data.status.checkout.id}`,
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
 * @param {ItemType} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'order', orderDataSchema, 
  /**
   * @param {ItemType} final 
   */
  async (final) => {
    final?.search?.push(...create_search_index(final));
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
