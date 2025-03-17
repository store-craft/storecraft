/**
 * @import { ProductType, ProductTypeUpsert, VariantTypeUpsert } from './types.api.js'
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


/**
 * @param {App} app
 */
export const db = app => app.db.resources.products;


/**
 * 
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

    return before;
  },
  (final) => {
    return union(
      final?.collections?.map(c => c?.handle && `col:${c?.handle}`),
      final?.collections?.map(c => `col:${c?.id}`),
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
export const add_product_to_collection = (app) => 
  /**
   * @description add a product to a collection
   * @param {string} product handle or id
   * @param {string} collection handle or id
   */
  (product, collection) => {
    return db(app).add_product_to_collection(product, collection);
  }

/**
 * 
 * @param {App} app
 */
export const remove_product_from_collection = (app) => 
/**
 * @description remove a product from a collection
 * @param {string} product handle or id
 * @param {string} collection handle or id
 */
(product, collection) => {
  return db(app).remove_product_from_collection(product, collection);
}

/**
 * @param {App} app
 */
export const list_product_collections = (app) => 
/**
 * @description list collections of a product
 * @param {string} handle_or_id handle or id
 */
(handle_or_id) => {
  return db(app).list_product_collections(handle_or_id);
}

/**
 * @param {App} app
 */
export const list_product_variants = (app) => 
  /**
   * @description list variants of a product
   * @param {string} product handle or id
   */
  (product) => {
    return db(app).list_product_variants(product);
  }


/**
 * @param {App} app
 */
export const list_related_products = (app) => 
/**
 * @description list related products of a product
 * @param {string} product handle or id
 */
(product) => {
  return db(app).list_related_products(product);
}


/**
 * @param {App} app
 */
export const list_product_discounts = (app) => 
/**
 * @description list discounts of a product
 * @param {string} product handle or id
 */
(product) => {
  return db(app).list_product_discounts(product);
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
    list_product_collections: list_product_collections(app),
    list_product_discounts: list_product_discounts(app),
    list_product_variants: list_product_variants(app),
    list_related_products: list_related_products(app),
    changeStockOfBy: db(app).changeStockOfBy
  }
}


