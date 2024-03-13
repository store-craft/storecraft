import { assert, to_handle, union } from './utils.func.js'
import { productTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('./types.api.js').ProductType} ItemType
 * @typedef {import('./types.api.js').ProductTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.products;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'pr', productTypeUpsertSchema, 
  async (final) => {
    
    assert(
      [final.handle].every(
        h => to_handle(h)===h
      ),
      'Handle is invalid', 400
    );
    final.search.push(
      ...union(
        final?.collections?.map(c => c?.handle && `col:${c?.handle}`),
        final?.collections?.map(c => `col:${c?.id}`),
      )
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
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} product handle or id
 * @param {string} collection handle or id
 */
export const add_product_to_collection = (app, product, collection) => {
  return db(app).add_product_to_collection(product, collection);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} product handle or id
 * @param {string} collection handle or id
 */
export const remove_product_from_collection = (app, product, collection) => {
  return db(app).remove_product_from_collection(product, collection);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id handle or id
 */
export const list_product_collections = (app, handle_or_id) => {
  return db(app).list_product_collections(handle_or_id);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} product handle or id
 */
export const list_product_variants = (app, product) => {
  return db(app).list_product_variants(product);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} product handle or id
 */
export const list_product_discounts = (app, product) => {
  return db(app).list_product_discounts(product);
}
