/**
 * @import { DiscountType, DiscountTypeUpsert, ProductType, VariantType } from './types.api.js'
 * @import { HandleOrId, RegularGetOptions, ID as IDType } from '../database/types.public.js'
 * @import { ApiQuery } from './types.api.query.js'
 */
import { assert, to_handle, union } from './utils.func.js'
import { discountTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'
import { isDef } from './utils.index.js';
import { App } from '../index.js';


/**
 * @param {App} app
 */
export const db = app => app.db.resources.discounts;

/**
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `discount`
 * @param {DiscountTypeUpsert} item
 */
(item) => regular_upsert(
  app, db(app), 'dis', discountTypeUpsertSchema, 
  (before) => {
    
    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    }
  },
  (final) => {
    return union(
      
      isDef(final?.application) && `app:${final.application.id}`,
      isDef(final?.application?.name) && `app:${final.application.name.toLowerCase()}`,
      isDef(final?.info?.details?.meta) && `type:${final.info.details.meta.id}`,
      isDef(final?.info?.details?.meta) && `type:${final.info.details.meta.type}`,
    );
  },
  'discounts/upsert'
)(item);


/**
 * @param {App} app
 */
export const list_discount_products = (app) => 
/**
 * @description given a discount handle and query,
 * return products of that discount
 * @param {HandleOrId} handle_or_id 
 * @param {ApiQuery<ProductType>} [q] 
 */
(handle_or_id, q) => {
  return db(app).list_discount_products(handle_or_id, q);
}

/**
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<DiscountType>} query 
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
   * @param {string} id_or_handle id or handle of the discount
   * @param {ApiQuery<ProductType | VariantType>} query query object for products
   */
  (id_or_handle, query) => {
    return db(app).count_discount_products(id_or_handle, query);
  }  


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'discounts/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'discounts/remove'),
    list: regular_list(app, db(app), 'discounts/list'),
    list_discount_products: list_discount_products(app),
    count_collection_products_query: count_collection_products_query(app),
    count: count(app)
  }
}
