/**
 * @import { DiscountType, DiscountTypeUpsert, ProductType, VariantType } from './types.api.js'
 * @import { HandleOrId } from '../database/types.public.js'
 * @import { ApiQuery } from './types.api.query.js'
 */
import { assert, to_handle, union } from './utils.func.js'
import { discountTypeUpsertSchema } from './types.autogen.zod.api.js'
import { 
  regular_get, regular_list, 
  regular_remove, regular_upsert 
} from './con.shared.js'
import { isDef } from './utils.index.js';
import { App } from '../index.js';
import { 
  is_product_filter, is_order_filter, DiscountMetaEnum 
} from './types.api.enums.js';


/**
 * @param {App} app
 */
export const db = app => app.__show_me_everything.db.resources.discounts;

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
    
    before.priority ??= 0;
    
    { // Upgrade deprecated `meta` props
      const type = before?.info?.details?.type ?? before?.info?.details?.meta?.type;

      assert(
        type,
        'Discount has no type, please set a type'
      );

      delete before.info.details.meta;

      before.info.details.type = type;

      // now align filters with deprecated `meta` properties
      for (const filter of before?.info?.filters ?? []) {
        filter.op = filter.op ?? filter?.meta?.op;
        delete filter.meta;
        assert(
          filter.op,
          'Filter does not specify an operator'
        );
      }
    }

    {
      // now we can check if the filters are valid
      // if the discount is of type `order`, then all filters must be of type `order`
      // if the discount is of type `product`, then all filters must be of type `product`
      const type = before.info.details.type;

      if(type==='order') {
        for (const filter of (before?.info?.filters ?? [])) {
          assert(
            // @ts-ignore
            is_order_filter(filter),
            'Discount with `order` type must only contain `order` filters'
          );
        }
      }
      else if(type) { // else this is a product discount
        for (const filter of (before?.info?.filters ?? [])) {
          assert(
            // @ts-ignore
            is_product_filter(filter),
            `Discount with product type must only contain \`product\` filters,
            Instead a filter with op \`${filter.op}\` was found`
          );
        }
      } else {
        assert(
          false,
          'Discount has no type, please set a type'
        );
      }
    }

    return {
      ...before,
      handle: before.handle ?? to_handle(before.title)
    }
  },
  (final) => {
    return union(
      isDef(final?.application) && `app:${final.application.id}`,
      isDef(final?.application?.name2) && `app:${final.application.name2}`,
      isDef(final?.info?.details?.type) && `type:${final.info.details.type}`,
      isDef(final?.info?.details?.type) && `type:${DiscountMetaEnum[final?.info?.details?.type].id}`,
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
   * @param {string} id_or_handle id or handle of the discount
   * @param {ApiQuery<ProductType | VariantType>} query query object for products
   */
  (id_or_handle, query) => {
    return db(app).count_discount_products(id_or_handle, query);
  }  

/**
 * @param {App} app
 */
export const list_used_discount_products_tags = (app) => 
  /**
   * @description List all the tags of all the products, that belong to a discount. 
   * This is helpful for building a filter system in the frontend if you know 
   * in advance all the tags of the products in a collection
   * @param {string} id_or_handle id or handle of the discount
   */
  (id_or_handle) => {
    return db(app).list_all_discount_products_tags(id_or_handle);
  }  


/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'discounts/get'),
    upsert: upsert(app),
    remove: regular_remove(app, db(app), 'discounts/remove'),
    list: regular_list(app, db(app), 'discounts/list'),
    list_discount_products: list_discount_products(app),
    list_used_discount_products_tags: list_used_discount_products_tags(app),
    count_discount_products_query: count_collection_products_query(app),
    count: count(app)
  }
}
