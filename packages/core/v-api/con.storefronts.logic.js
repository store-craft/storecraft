import { assert, to_handle } from './utils.func.js'
import { storefrontTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('./types.api.js').StorefrontType} ItemType
 * @typedef {import('./types.api.js').StorefrontTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.storefronts;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'sf', storefrontTypeUpsertSchema, 
  async (final) => {
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle or Values are invalid', 400
    );
    return final;
  }
)(item);


/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 * @param {import('../v-database/types.public.js').RegularGetOptions} [options]
 */
export const get = (app, handle_or_id, options) => 
      regular_get(app, db(app))(handle_or_id, options);

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
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id handle or id
 */
export const list_storefront_products = (app, handle_or_id) => {
  return db(app).list_storefront_products(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id handle or id
 */
export const list_storefront_collections = (app, handle_or_id) => {
  return db(app).list_storefront_collections(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id handle or id
 */
export const list_storefront_discounts = (app, handle_or_id) => {
  return db(app).list_storefront_discounts(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id handle or id
 */
export const list_storefront_shipping_methods = (app, handle_or_id) => {
  return db(app).list_storefront_shipping_methods(handle_or_id);
}

/**
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id handle or id
 */
export const list_storefront_posts = (app, handle_or_id) => {
  return db(app).list_storefront_posts(handle_or_id);
}
