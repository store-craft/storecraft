/**
 * @import { db_products as db_col, RegularGetOptions } from '@storecraft/core/database'
 * @import { ProductType, VariantType } from '@storecraft/core/api'
 * @import { WithRelations } from './utils.relations.js'
 * @import { Filter, AnyBulkWriteOperation } from 'mongodb'
 */

import { Collection } from 'mongodb'
import { MongoDB } from '../index.js'
import { 
  count_regular, get_bulk, get_regular, list_regular, 
  zeroed_relations
} from './con.shared.js'
import { 
  delete_keys, handle_or_id, sanitize_array, sanitize_one, to_objid 
} from './utils.funcs.js'
import { 
  add_search_terms_relation_on, create_explicit_relation, 
  delete_me, 
  remove_entry_from_all_connection_of_relation, 
  remove_specific_connection_of_relation, 
  remove_specific_connection_of_relation_with_filter, 
  save_me, 
  update_entry_on_all_connection_of_relation,
  update_specific_connection_of_relation,
  update_specific_connection_of_relation_with_filter
} from './utils.relations.js'
import { enums } from '@storecraft/core/api'
import { report_document_media } from './con.images.js'
import { union } from '@storecraft/core/api/utils.func.js'
import { 
  test_product_filters_against_product 
} from '@storecraft/core/api/con.pricing.logic.js'

/**
 * @param {MongoDB} d 
 * 
 * 
 * @returns {Collection<WithRelations<db_col["$type_get"]>>}
 */
const col = (d) => d.collection('products');

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data, search_terms=[]) => {
    // console.log('search_terms', search_terms)
    data = {...data};

    const objid = to_objid(data.id);
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          ////
          // COLLECTIONS RELATION (explicit)
          ////
          let replacement = await create_explicit_relation(
            driver, data, 'collections', 'collections', true
          );

          //// 
          // PRODUCTS -> Related Products RELATION (explicit)
          ////
          replacement = await create_explicit_relation(
            driver, replacement, 'related_products', 'products', true
          );

          ////
          // DISCOUNTS RELATION
          ////
          // get all automatic + active discounts
          const discounts = await driver.resources.discounts._col.find(
            { 
              'application.id': enums.DiscountApplicationEnum.Auto.id,
              active: true
            }, {
              limit: 1000,
              projection: zeroed_relations
            }
          ).toArray();

          // now test locally
          const eligible_discounts = discounts.filter(
            d => test_product_filters_against_product(
              d.info.filters, data
            )
          );

          // console.log('eligible_discounts', eligible_discounts)
          
          // now replace discounts relation
          replacement._relations = replacement._relations ?? {};
          replacement._relations.discounts = {
            ids: eligible_discounts.map(d => d._id),
            entries: Object.fromEntries(
              eligible_discounts.map(d => [d._id.toString(), d])
            )
          }

          replacement.tags = union(
            [
              // remove old discount tags
              replacement.tags?.filter(t => !t.startsWith('discount_')),
              // add new discount tags
              eligible_discounts.map(d => `discount_${d.handle}`),
            ]
          );

          // SEARCH
          add_search_terms_relation_on(
            replacement, union(
              [
                search_terms, 
                eligible_discounts.map(d => `discount:${d.handle}`),
                eligible_discounts.map(d => `discount:${d.id}`),
                eligible_discounts.map(d => `tag:discount_${d.handle}`),
              ]
            )
          );

          delete_keys(
            'collections', 'variants', 'discounts', 'related_products', 'search'
          )(replacement);

          // Now update other relations, that point to me

          //// 
          // Related Products -> PRODUCTS RELATION (explicit)
          ////
          await update_entry_on_all_connection_of_relation(
            driver, 'products', 'related_products', objid, replacement, session
          );

          ////
          // VARIANTS RELATION
          ////
          
          if(`parent_handle` in data) { // is variant ?
            // TODO: stronger validation of variant identification
            
            const isValid = (
              data.parent_handle && data.parent_id && data.variant_hint
            );

            if(isValid) {
              // update parent product
              await update_specific_connection_of_relation(
                driver, 'products', 'variants', to_objid(data.parent_id),
                objid, replacement, session
              );

            }

          } else { // i am a parent
            // let's fetch existing relations if any
            const existing =  await await col(driver).findOne(
              { _id: objid }
            );
            if(existing && existing?._relations?.variants) {
              replacement._relations = replacement._relations ?? {};
              replacement._relations.variants = existing._relations.variants; 
            }
          }

          ////
          // STOREFRONTS -> PRODUCTS RELATION
          ////
          await update_entry_on_all_connection_of_relation(
            driver, 'storefronts', 'products', objid, replacement, session
          );
          
          ////
          // REPORT IMAGES USAGE
          ////
          await report_document_media(driver)(replacement, session);

          // SAVE ME
          await save_me(driver, 'products', objid, replacement, session);

        }
      );
    } catch (e) {
      console.log(e);
      
      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }
}
 

/**
 * 
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    // todo: transaction

    const item = await col(driver).findOne(handle_or_id(id));

    if(!item) return;
    
    const objid = to_objid(item.id);
    const session = driver.mongo_client.startSession();

    try {
      await session.withTransaction(
        async () => {

          ////
          // PRODUCTS -> VARIANTS RELATION
          ////
          const is_variant = `parent_handle` in item;

          if(is_variant) {
            // TODO: stronger validation
            const isValid = (
              item.parent_handle && item.parent_id && item.variant_hint
            );

            if(isValid) {
              // remove me from parent
              await remove_specific_connection_of_relation(
                driver, 'products', 'variants', to_objid(item.parent_id),
                objid, session
              );

            }

          } else {
            // I am a parent, let's delete all of the children variants
            const ids = item?._relations?.variants?.ids;
            if(ids) {
              await driver.resources.products._col.deleteMany(
                { _id: { $in: ids } },
                { session }
              );
            }
          }

          ////
          // STOREFRONTS --> PRODUCTS RELATION
          ////
          await remove_entry_from_all_connection_of_relation(
            driver, 'storefronts', 'products', objid, session
          );

          ////
          // PRODUCTS --> RELATED PRODUCTS RELATION
          ////
          await remove_entry_from_all_connection_of_relation(
            driver, 'products', 'related_products', objid, session
          );

          // DELETE ME
          await delete_me(
            driver, 'products', objid, session
          );

        }
      );
    } catch (e) {
      console.log(e);
      return false;
    } finally {
      await session.endSession();
    }    

    return true;
  }

}

/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 */
const count = (driver) => count_regular(driver, col(driver));


/**
 * For now and because each product is related to very few
 * collections, I will not expose the query api, and use aggregate
 * instead.
 * 
 * 
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_all_product_collections"]}
 */
const list_product_collections = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['collections']
    };

    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.collections ?? []);
  }
}

/**
 * For now and because each product is related to very few
 * collections, I will not expose the query api, and use aggregate
 * instead.
 * 
 * 
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_all_product_variants"]}
 */
const list_product_variants = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['variants']
    };

    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);

    if(item && ('variants' in item)) {
      
      return sanitize_array(item?.variants ?? []);
    }

    return [];
  }
}

/**
 * For now and because each product is related to very few
 * collections, I will not expose the query api, and use aggregate
 * instead.
 * 
 * 
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_all_related_products"]}
 */
const list_related_products = (driver) => {
  return async (product) => {
    /** @type {import('@storecraft/core/database').RegularGetOptions} */
    const options = {
      expand: ['related_products']
    };

    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.related_products ?? []);
  }
}


/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["list_all_product_discounts"]}
 */
const list_product_discounts = (driver) => {
  return async (product) => {
    /** @type {RegularGetOptions} */
    const options = {
      expand: ['discounts']
    };

    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);

    return sanitize_array(item?.discounts ?? []);
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["add_product_to_collection"]}
 */
const add_product_to_collection = (driver) => {
  return async (product_id_or_handle, collection_handle_or_id) => {

    const coll = await driver.resources.collections._col.findOne(
      handle_or_id(collection_handle_or_id)
    );

    if(!coll)
      return;

    const objid = to_objid(coll.id);

    await update_specific_connection_of_relation_with_filter(
      driver, 'products', 'collections', 
      handle_or_id(product_id_or_handle),
      objid, coll, undefined, 
      [
        `col:${coll.handle}`, `col:${coll.id}`
      ]
    );

  }
}


/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["remove_product_from_collection"]}
 */
const remove_product_from_collection = (driver) => {
  return async (product_id_or_handle, collection_handle_or_id) => {

    const coll = await driver.resources.collections._col.findOne(
      handle_or_id(collection_handle_or_id)
    );

    if(!coll)
      return;

    const objid = to_objid(coll.id);

    await remove_specific_connection_of_relation_with_filter(
      driver, 'products', 'collections', 
      handle_or_id(product_id_or_handle), 
      objid, undefined, 
      [
        `col:${coll.handle}`, `col:${coll.id}`
      ]
    );
  }
}

/**
 * @param {MongoDB} driver 
 * 
 * 
 * @returns {db_col["changeStockOfBy"]}
 */
const changeStockOfBy = (driver) => {
  return async (product_ids_or_handles, deltas) => {

    /** 
     * @type {AnyBulkWriteOperation<WithRelations<ProductType | VariantType>>[]}
     */
    let ops = []

    product_ids_or_handles.forEach(
      (id, ix) => {
        ops.push(
          {
            updateOne: {
              filter: handle_or_id(id),
              update: {
                $inc: { qty: Math.round(deltas[ix]) }
              }
            }
          }
        );

        ops.push(
          {
            updateOne: {
              filter: handle_or_id(id),
              update: {
                $max: { qty: 0 }
              }
            }
          }
        );

      }
    );

    if(!ops.length)
      return;

    await driver.resources.products._col.bulkWrite(
      ops
    );

  }
}


/**
 * @param {MongoDB} driver 
 * @returns {db_col["list_all_products_tags"]}
 */
const list_all_products_tags = (driver) => {
  return async () => {
    const items = await driver.resources.products._col.find(
      {
      },
      {
        projection: {
          tags: 1
        }
      }
    ).toArray();

    const set = (items ?? []).reduce(
      (p, c) => {
        c.tags.forEach(
          (tag) => p.add(tag)
        );
        return p;
      }, new Set()
    )
    // return array from set
    return Array.from(set);
  }
}


/** 
 * @param {MongoDB} driver
 * 
 * 
 * @return {db_col & { _col: ReturnType<col> }}
 */
export const impl = (driver) => {

  return {
    _col: col(driver),
    changeStockOfBy: changeStockOfBy(driver), 
    get: get(driver),
    getBulk: get_bulk(driver, col(driver)),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    add_product_to_collection: add_product_to_collection(driver),
    remove_product_from_collection: remove_product_from_collection(driver),
    list_all_product_collections: list_product_collections(driver),
    list_all_product_variants: list_product_variants(driver),
    list_all_related_products: list_related_products(driver),
    list_all_product_discounts: list_product_discounts(driver),
    list_all_products_tags: list_all_products_tags(driver),
    count: count(driver)
  }
}
 