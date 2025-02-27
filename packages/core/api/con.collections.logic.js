import { assert, to_handle } from './utils.func.js'
import { collectionTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert 
} from './con.shared.js';
import { App } from '../index.js';

/**
 * @typedef {import('./types.api.d.ts').CollectionType} ItemType
 * @typedef {import('./types.api.d.ts').CollectionTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {App} app
 */
export const db = app => app.db.resources.collections;

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
    app, db(app), 'col', collectionTypeUpsertSchema, 
    (before) => {
      return {
        ...before,
        handle: before.handle ?? to_handle(before.title)
      }
    },
    (final) => {
      return [];
    },'collections/upsert'
  )(item);


/**
 * @description given a collection handle and query, 
 * return products of that collection
 * 
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const list_collection_products = (app) => 
  /**
   * 
   * @param {import('../database/types.public.d.ts').HandleOrId} handle_or_id 
   * @param {import('./types.api.query.d.ts').ApiQuery} [q] 
   */
  (handle_or_id, q={}) => {
    return db(app).list_collection_products(handle_or_id, q);
  }


/**
 * @description Export a colletion of `products` into the `storage`. This is
 * beneficial for `collections`, that hardly change and therefore can be 
 * efficiently stored in a cost-effective `storage` and **CDN** network.
 * 
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const export_collection = (app) => {
  
  /**
   * 
   * @param {import('../database/types.public.d.ts').HandleOrId} handle_or_id 
   * 
   * @return {Promise<string>}
   */
  return async (handle_or_id) => {
    const collection = await inter(app).get(handle_or_id);

    assert(
      collection,
      'export failed'
    );

    const items = await list_collection_products(app)(
      handle_or_id,
      {
        limit: 400
      }
    );
    const encoder = new TextEncoder();
    const array = encoder.encode(JSON.stringify(items));

    const key = `collections/${collection.handle}.json`;
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
        ...collection,
        published: publish_path
      }
    );

    return publish_path;
  }
}  

/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'collections/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'collections/remove'),
    list: regular_list(app, db(app), 'collections/list'),
    list_collection_products: list_collection_products(app),
    export_collection: export_collection(app)
  }
}


