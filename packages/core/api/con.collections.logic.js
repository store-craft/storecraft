/**
 * @import { CollectionType, CollectionTypeUpsert, ProductType, VariantType } from './types.api.js'
 * @import { HandleOrId, RegularGetOptions, ID as IDType } from '../database/types.public.js'
 * @import { ApiQuery } from './types.api.query.js'
 */
import { assert, to_handle } from './utils.func.js'
import { collectionTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert 
} from './con.shared.js';
import { App } from '../index.js';

/**
 * @param {App} app
 */
export const db = app => app.db.resources.collections;

/**
 * @description `upsert` a `collection`
 * @param {App} app
 */
export const upsert = (app) => 
  /**
   * 
   * @param {CollectionTypeUpsert} item
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
 * @param {App} app
 */
export const list_collection_products = (app) => 
  /**
   * @description given a collection handle and query, 
   * return products of that collection
   * 
   * @param {HandleOrId} handle_or_id 
   * @param {ApiQuery<ProductType>} [q] 
   */
  (handle_or_id, q={}) => {
    return db(app).list_collection_products(handle_or_id, q);
  }


/**
 * @param {App} app
 */
export const list_collection_products_tags = (app) => 
  /**
   * @description List all the tags of products in a collection, This is helpful 
   * for building a filter system in the frontend if you know in advance all 
   * the tags of the products in a collection
   * 
   * @param {HandleOrId} handle_or_id 
   */
  (handle_or_id) => {
    return db(app).list_all_collection_products_tags(handle_or_id);
  }

/**
 * @param {App} app
 */
export const export_collection = (app) => {
  
  /**
   * @description Export a colletion of `products` into the `storage`. This is
   * beneficial for `collections`, that hardly change and therefore can be 
   * efficiently stored in a cost-effective `storage` and **CDN** network.
   * 
   * @param {HandleOrId} handle_or_id 
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
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<CollectionType>} query 
   */
  (query) => {
    return db(app).count(query);
  }
  

/**
 * @param {App} app
 */
export const count_collection_products_query = (app) => 
  /**
   * @description Count query results
   * 
   * @param {string} id_or_handle id or handle of the collection
   * @param {ApiQuery<ProductType | VariantType>} query query object for products
   */
  (id_or_handle, query) => {
    return db(app).count_collection_products(id_or_handle, query);
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
    count_collection_products_query: count_collection_products_query(app),
    list_all_collection_products_tags: list_collection_products_tags(app),
    export_collection: export_collection(app),
    count: count(app),
  }
}


