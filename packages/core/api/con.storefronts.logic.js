/**
 * @import { StorefrontType, StorefrontTypeUpsert } from './types.api.js'
 * @import { HandleOrId, ID as IDType } from '../database/types.public.js'
 */
import { App } from "../index.js";
import { assert, to_handle } from './utils.func.js'
import { storefrontTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @param {App} app
 */
export const db = app => app.db.resources.storefronts;

/**
 * 
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {StorefrontTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'sf', storefrontTypeUpsertSchema, 
  (before) => {
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    };
  },
  (final) => {
    return [];
  },
  'storefronts/upsert'
)(item);


/**
 * 
 * @param {App} app
 */
export const list_storefront_products = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_products(handle_or_id);
}

/**
 * @param {App} app
 */
export const list_storefront_collections = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_collections(handle_or_id);
}

/**
 * @param {App} app
 */
export const list_storefront_discounts = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_discounts(handle_or_id);
}

/**
 * @param {App} app
 */
export const list_storefront_shipping_methods = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_shipping_methods(handle_or_id);
}

/**
 * @param {App} app
 */
export const list_storefront_posts = (app) => 
/**
 * 
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_storefront_posts(handle_or_id);
}


/**
 * @param {App} app
 */
export const export_storefront = (app) => {
  /**
   * @description Export a storefront into the `storage`. This is
   * beneficial for things`, that hardly change and therefore can be 
   * efficiently stored and retrieved from a cost-effective `storage` and **CDN** network.
   * 
   * @param {HandleOrId} handle_or_id 
   * 
   * @return {Promise<string>}
   */
  return async (handle_or_id) => {
    const sf = await inter(app).get(handle_or_id);

    assert(
      sf,
      'storefront not found'
    );

    assert(
      app.storage,
      'storage not available'
    );

    const encoder = new TextEncoder();
    const array = encoder.encode(JSON.stringify(sf));

    const key = `storefronts/${sf.handle}.json`;
    const publish_path = `storage://${key}`;
    const success = await app.storage.putArraybuffer(
      key,
      // @ts-ignore
      array
    );

    assert(
      success,
      'export failed'
    );

    await upsert(app)(
      {
        ...sf,
        published: publish_path
      }
    );

    return publish_path;
  }
}  


/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'storefronts/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'storefronts/remove'),
    list: regular_list(app, db(app), 'storefronts/list'),
    list_storefront_products: list_storefront_products(app),
    list_storefront_collections: list_storefront_collections(app),
    list_storefront_discounts: list_storefront_discounts(app),
    list_storefront_posts: list_storefront_posts(app),
    list_storefront_shipping_methods: list_storefront_shipping_methods(app),
    export_storefront: export_storefront(app),
  }
}
