import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { get_bulk, get_regular, list_regular } from './con.shared.js'
import { handle_or_id, sanitize, to_objid } from './utils.funcs.js'
import { create_explicit_relation } from './utils.relations.js'
import { DiscountApplicationEnum } from '@storecraft/core'
import { test_product_filters_against_product } from '@storecraft/core/v-api'
import { report_document_media } from './con.images.js'

/**
 * @typedef {import('@storecraft/core').db_products} db_col
 */

/**
 * @param {MongoDB} d 
 * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type"]>>}
 */
const col = (d) => d.collection('products');

/**
 * @param {MongoDB} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (data) => {
    
    const objid = to_objid(data.id);
    const filter = { _id: objid };
    const options = { upsert: true };

    ////
    // VARIANTS RELATION
    ////
    const is_variant = data?.parent_handle && data?.parent_id && data?.variant_hint;
    if(is_variant) {
      // update parent product
      await driver.products._col.updateOne(
        { _id : to_objid(data.parent_id) },
        { 
          $set: { [`_relations.variants.entries.${objid.toString()}`]: data },
          $addToSet: { '_relations.variants.ids': objid }
        },
      );
    } else {
      // in the future, support also explicit relation with `create_explicit_relation`
    }

    ////
    // COLLECTIONS RELATION (explicit)
    ////
    const replacement = await create_explicit_relation(
      driver, data, 'collections', 'collections', false
    );

    ////
    // DISCOUNTS RELATION
    ////
    // get all automatic + active discounts
    const discounts = await driver.discounts._col.find(
      { 
        'application.id': DiscountApplicationEnum.Auto.id,
        active: true
      }
    ).toArray();
    // now test locally
    const eligible_discounts = discounts.filter(
      d => test_product_filters_against_product(d.info.filters, data)
    );
    // now replace discounts relation
    replacement._relations = replacement._relations ?? {};
    replacement._relations.discounts = {
      ids: eligible_discounts.map(d => d._id),
      entries: Object.fromEntries(eligible_discounts.map(d => [d._id.toString(), d]))
    }
    replacement.search = replacement.search ?? [];
    eligible_discounts.forEach(
      d => replacement.search.push(
        `discount:${d.handle}`, `discount:${d.id}`
      )
    );

    ////
    // STOREFRONTS -> PRODUCTS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.products.ids' : objid },
      { $set: { [`_relations.products.entries.${objid.toString()}`]: data } },
    );
    
    ////
    // REPORT IMAGES USAGE
    ////
    await report_document_media(driver)(data);
    
    // SAVE ME
    const res = await driver.products._col.replaceOne(
      filter, replacement, options
    );
    
    return;
  }
}

/**
 * @param {MongoDB} driver 
 */
const get = (driver) => get_regular(driver, col(driver));

/**
 * @param {MongoDB} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    // todo: transaction

    const item = await col(driver).findOne(handle_or_id(id));
    const objid = to_objid(item.id);
    
    ////
    // PRODUCTS -> VARIANTS RELATION
    ////
    const is_variant = item?.parent_handle && item?.parent_id && item?.variant_hint;
    if(is_variant) {
      // remove me from parent
      await driver.products._col.updateOne(
        { _id : to_objid(item.parent_id) },
        { 
          $pull: { '_relations.variants.ids': objid },
          $unset: { [`_relations.variants.entries.${objid.toString()}`]: '' },
        },
      );
    } else {
      // I am a parent, let's delete all of the children variants
      const ids = item?._relations?.variants?.ids;
      if(ids) {
        await driver.products._col.deleteMany(
          { _id: { $in: ids } }
        );
      }
    }

    ////
    // STOREFRONTS --> PRODUCTS RELATION
    ////
    await driver.storefronts._col.updateMany(
      { '_relations.products.ids' : objid },
      { 
        $pull: { '_relations.products.ids': objid, },
        $unset: { [`_relations.products.entries.${objid.toString()}`]: '' },
      },
    );

    // DELETE ME
    const res = await col(driver).findOneAndDelete(
      { _id: objid }
    );

    return
  }

}

/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));


/**
 * For now and because each product is related to very few
 * collections, I will not expose the query api, and use aggregate
 * instead.
 * @param {MongoDB} driver 
 * @returns {db_col["list_product_collections"]}
 */
const list_product_collections = (driver) => {
  return async (product) => {
    /** @type {import('@storecraft/core').RegularGetOptions} */
    const options = {
      expand: ['collections']
    };
    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);
    return sanitize(item?.collections);
  }
}

/**
 * For now and because each product is related to very few
 * collections, I will not expose the query api, and use aggregate
 * instead.
 * @param {MongoDB} driver 
 * @returns {db_col["list_product_collections"]}
 */
const list_product_variants = (driver) => {
  return async (product) => {
    /** @type {import('@storecraft/core').RegularGetOptions} */
    const options = {
      expand: ['variants']
    };
    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);
    return sanitize(item?.variants);
  }
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["list_product_discounts"]}
 */
const list_product_discounts = (driver) => {
  return async (product) => {
    /** @type {import('@storecraft/core').RegularGetOptions} */
    const options = {
      expand: ['discounts']
    };
    // We have collections embedded in products, so let's use it
    const item = await get_regular(driver, col(driver))(product, options);
    return sanitize(item?.discounts);
  }
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["add_product_to_collection"]}
 */
const add_product_to_collection = (driver) => {
  return async (product_id_or_handle, collection_handle_or_id) => {

    // 
    const coll = await driver.collections._col.findOne(
      handle_or_id(collection_handle_or_id)
    );

    if(!coll)
      return;

    const objid = to_objid(coll.id);
    await driver.products._col.updateOne(
      handle_or_id(product_id_or_handle),
      { 
        $set: { [`_relations.collections.entries.${objid.toString()}`]: coll },
        $addToSet: { 
          '_relations.collections.ids': objid, 
          search: { $each : [`col:${coll.handle}`, `col:${coll.id}`]} 
        }
      },
    );

  }
}

/**
 * @param {MongoDB} driver 
 * @returns {db_col["remove_product_from_collection"]}
 */
const remove_product_from_collection = (driver) => {
  return async (product_id_or_handle, collection_handle_or_id) => {

    // 
    const coll = await driver.collections._col.findOne(
      handle_or_id(collection_handle_or_id)
    );
    if(!coll)
      return;

    const objid = to_objid(coll.id);
    await driver.products._col.updateOne(
      handle_or_id(product_id_or_handle),
      { 
        $unset: { [`_relations.collections.entries.${objid.toString()}`]: '' },
        $pull: { 
          '_relations.collections.ids': objid, 
          search: { $in : [`col:${coll.handle}`, `col:${coll.id}`]} 
        }
      },
    );

  }
}

/** 
 * @param {MongoDB} driver
 * @return {db_col & { _col: ReturnType<col> }}
 */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    getBulk: get_bulk(driver, col(driver)),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    add_product_to_collection: add_product_to_collection(driver),
    remove_product_from_collection: remove_product_from_collection(driver),
    list_product_collections: list_product_collections(driver),
    list_product_variants: list_product_variants(driver),
    list_product_discounts: list_product_discounts(driver),
  }
}
 