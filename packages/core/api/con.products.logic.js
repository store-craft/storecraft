/**
 * @import { 
 *  ApiQuery, ProductType, ProductTypeUpsert, VariantType, VariantTypeUpsert 
 * } from './types.public.js'
 */
import { assert, to_handle, union } from './utils.func.js'
import { 
  productTypeUpsertSchema, variantTypeUpsertSchema 
} from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert 
} from './con.shared.js'
import { App } from '../index.js';
import { assert_zod } from './middle.zod-validate.js';


/**
 * @description check if an item is a variant
 * @param {any} item 
 */
export const isVariant = item => {
  return (
    ('parent_handle' in item) &&
    ('parent_id' in item) &&
    ('variant_hint' in item)
  );
}


/** @param {App} app */
export const db = app => app.__show_me_everything.db.resources.products;


/**
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `product` or `variant`
 * @param {ProductTypeUpsert | VariantTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'pr', (productTypeUpsertSchema.or(variantTypeUpsertSchema)), 
  (before) => {
    
    before = {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    }

    const is_variant = isVariant(before);
    
    assert_zod(
      is_variant ? variantTypeUpsertSchema : productTypeUpsertSchema, 
      item
    );

    // auto tag the product with the collection handle
    if(Array.isArray(before?.collections)) {
      before.tags = union(
        // remove old collection tags
        item.tags?.filter(t => !t.startsWith('collection_')),
        // add new collection tags
        item.collections.map(c => `collection_${c.handle}`),
      );
    }

    return before;
  },
  (final) => {
    return union(
      final?.collections?.map(c => c?.handle && `col:${c?.handle}`),
      final?.collections?.map(c => `col:${c?.id}`),
      final?.collections?.map(c => c?.handle && `collection:${c?.handle}`),
      final?.collections?.map(c => `collection:${c?.id}`),
      item.isbn && `isbn:${item.isbn}`,
      item.isbn,
      `qty:${item.qty}`
    );
  },
  'products/upsert',
)(item);


/**
 * @param {App} app
 */
export const list_used_products_tags = (app) => 
  /**
   * @description List all of the tags of all the products deduped, 
   * This is helpful for building a filter system in the frontend if 
   * you know in advance all the tags of the products in a collection, 
   * also see the collection confined version db_collections.list_collection_products_tags
   */
  () => {
    return db(app).list_used_products_tags();
  }

/**
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<ProductType | VariantType>} query 
   */
  (query) => {
    return db(app).count(query);
  }
  
/**
 * @param {App} app
 */
export const changeStockOfBy = (app) => 

  /**
   * increment / decrement stock of multiple products
   * @param {string[]} product_id_or_handles array of `id` or `handle`
   * @param {number[]} deltas corresponding array of non-zero `positive` or 
   * `negative` integer
   */
  (product_id_or_handles, deltas) => {
    return db(app).changeStockOfBy(product_id_or_handles, deltas);
  }
  
  
/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'products/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'products/remove'),
    list: regular_list(app, db(app), 'products/list'),
    list_used_products_tags: list_used_products_tags(app),
    changeStockOfBy: changeStockOfBy(app),
    count: count(app),
  }
}


