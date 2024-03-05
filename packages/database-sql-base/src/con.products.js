import { SQL } from '../driver.js'
import { delete_entity_values_of_by_entity_id_or_handle, delete_me, delete_media_of, 
  delete_search_of, delete_tags_of, expand, 
  insert_entity_values_of, insert_media_of, insert_search_of, 
  insert_tags_of, upsert_me, values_of_entity_table, 
  where_id_or_handle_table, products_with_collections, 
  with_tags,
  with_media} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'


/**
 * @typedef {import('@storecraft/core').db_products} db_col
 */
export const table_name = 'products'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item) => {
    const c = driver.client;
    try {
      const t = await driver.client.transaction().execute(
        async (trx) => {

          // entities
          const tt1 = await insert_tags_of(trx, item.tags, item.id, item.handle);
          const tt2 = await insert_search_of(trx, item.search, item.id, item.handle);
          const tt3 = await insert_media_of(trx, item.media, item.id, item.handle);
          // main
          await upsert_me(trx, table_name, item.id, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            active: item.active ? 1 : 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            title: item.title,
            compare_at_price: item.compare_at_price,
            price: item.price,
            video: item.video,
            qty: item.qty,
            variants_options: JSON.stringify(item.variants_options),
            // no variants yet
          });

          // Explicit PRODUCTS => COLLECTIONS
          if(item.collections) {
            await insert_entity_values_of('products_to_collections')(
              trx, item.collections.map(c => c.id), item.id, item.handle, true
            );
          }

        }
      );
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["get"]}
 */
const get = (driver) => {
  return async (id_or_handle, options) => {

    const expand = options?.expand ?? ['*'];
    const expand_tags = expand.includes('*') || expand.includes('tags');
    const expand_collections = expand.includes('*') || expand.includes('collections');

    const r = await driver.client
      .selectFrom(table_name)
      .selectAll('products')
      .select(eb => [
        expand_tags && with_tags(eb, id_or_handle),
        with_media(eb, id_or_handle),
        expand_collections && products_with_collections(eb, id_or_handle)
      ].filter(Boolean)
      )
      .where(where_id_or_handle_table(id_or_handle))
    //  .compile()
      .executeTakeFirst();
    
    return sanitize(r);
  }
}


/**
 * @param {SQL} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id_or_handle) => {
    try {
      const t = await driver.client.transaction().execute(
        async (trx) => {
            
          // entities
          await delete_tags_of(trx, id_or_handle);
          await delete_search_of(trx, id_or_handle);
          await delete_media_of(trx, id_or_handle);
          // delete me
          const d2 = await delete_me(trx, table_name, id_or_handle);
          // Explicit PRODUCTS => COLLECTIONS
          await delete_entity_values_of_by_entity_id_or_handle('products_to_collections')(
            trx, id_or_handle
          );

          return d2.numDeletedRows>0;
        }
      );

      return t;
    } catch(e) {
      console.log(e);
      return false;
    }
    return true;
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list"]}
 */
const list = (driver) => {
  return async (query) => {

    const expand = query.expand ?? ['*'];
    const expand_tags = expand.includes('*') || expand.includes('tags');
    const expand_collections = expand.includes('*') || expand.includes('collections');

    const items = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        expand_tags && with_tags(eb, eb.ref('products.id')),
        with_media(eb, eb.ref('products.id')),
        expand_collections && products_with_collections(eb, eb.ref('products.id'))
      ].filter(Boolean))
      .where(
        (eb) => {
          return query_to_eb(eb, query).eb;
        }
      ).orderBy(query_to_sort(query))
      .limit(query.limit ?? 10)
      .execute();
      // .compile();
        // console.log(items)

    return sanitize_array(items);
  }
}

/**
 * @param {SQL} driver 
 * @returns {db_col["list_product_collections"]}
 */
const list_product_collections = (driver) => {
  return async (product_id_or_handle) => {

    const items = await driver.client
      .selectFrom('collections')
      .selectAll('collections')
      .select(eb => [
        with_tags(eb, eb.ref('collections.id')),
        with_media(eb, eb.ref('collections.id'))
      ])
      .where('collections.id', 'in',
        eb => values_of_entity_table(eb, 'products_to_collections', product_id_or_handle)
      )
      .orderBy('collections.updated_at desc')
      // .limit()
      .execute();
    
    sanitize_array(items);
    // console.log(items)
    // try expand relations, that were asked
    // expand(items, query?.expand);

    return items;
  }
}


/** 
 * @param {SQL} driver
 * @return {db_col}}
 * */
export const impl = (driver) => {

  return {

    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    list_product_collections: list_product_collections(driver)
  }
}


// import { Collection } from 'mongodb'
// import { MongoDB } from '../driver.js'
// import { get_bulk, get_regular, list_regular } from './con.shared.js'
// import { handle_or_id, sanitize_array, to_objid } from './utils.funcs.js'
// import { create_explicit_relation } from './utils.relations.js'
// import { DiscountApplicationEnum } from '@storecraft/core'
// import { pricing } from '@storecraft/core/v-api'
// import { report_document_media } from './con.images.js'

// /**
//  * @typedef {import('@storecraft/core').db_products} db_col
//  */

// /**
//  * @param {MongoDB} d 
//  * @returns {Collection<import('./utils.relations.js').WithRelations<db_col["$type_get"]>>}
//  */
// const col = (d) => d.collection('products');

// /**
//  * @param {MongoDB} driver 
//  * @returns {db_col["upsert"]}
//  */
// const upsert = (driver) => {
//   return async (data) => {

//     const objid = to_objid(data.id);
//     const session = driver.mongo_client.startSession();

//     try {
//       await session.withTransaction(
//         async () => {
//           ////
//           // VARIANTS RELATION
//           ////
//           const is_variant = data?.parent_handle && data?.parent_id && data?.variant_hint;
//           if(is_variant) {
//             // update parent product
//             await driver.products._col.updateOne(
//               { _id : to_objid(data.parent_id) },
//               { 
//                 $set: { [`_relations.variants.entries.${objid.toString()}`]: data },
//                 $addToSet: { '_relations.variants.ids': objid }
//               },
//               { session }
//             );
//           } else {
//             // in the future, support also explicit relation with `create_explicit_relation`
//           }

//           ////
//           // COLLECTIONS RELATION (explicit)
//           ////
//           const replacement = await create_explicit_relation(
//             driver, data, 'collections', 'collections', false
//           );

//           ////
//           // DISCOUNTS RELATION
//           ////
//           // get all automatic + active discounts
//           const discounts = await driver.discounts._col.find(
//             { 
//               'application.id': DiscountApplicationEnum.Auto.id,
//               active: true
//             }
//           ).toArray();
//           // now test locally
//           const eligible_discounts = discounts.filter(
//             d => pricing.test_product_filters_against_product(d.info.filters, data)
//           );
//           // console.log('eligible_discounts', eligible_discounts)
//           // now replace discounts relation
//           replacement._relations = replacement._relations ?? {};
//           replacement._relations.discounts = {
//             ids: eligible_discounts.map(d => d._id),
//             entries: Object.fromEntries(eligible_discounts.map(d => [d._id.toString(), d]))
//           }
//           replacement.search = replacement.search ?? [];
//           eligible_discounts.forEach(
//             d => replacement.search.push(
//               `discount:${d.handle}`, `discount:${d.id}`
//             )
//           );

//           ////
//           // STOREFRONTS -> PRODUCTS RELATION
//           ////
//           await driver.storefronts._col.updateMany(
//             { '_relations.products.ids' : objid },
//             { $set: { [`_relations.products.entries.${objid.toString()}`]: data } },
//             { session }
//           );
          
//           ////
//           // REPORT IMAGES USAGE
//           ////
//           await report_document_media(driver)(data, session);

//           // SAVE ME
//           const res = await driver.products._col.replaceOne(
//             { _id: objid }, replacement, { session, upsert: true }
//           );

//         }
//       );
//     } catch (e) {
//       console.log(e);
//       return false;
//     } finally {
//       await session.endSession();
//     }

//     return true;
//   }
// }

// /**
//  * @param {MongoDB} driver 
//  */
// const get = (driver) => get_regular(driver, col(driver));

// /**
//  * @param {MongoDB} driver 
//  * @returns {db_col["remove"]}
//  */
// const remove = (driver) => {
//   return async (id) => {
//     // todo: transaction

//     const item = await col(driver).findOne(handle_or_id(id));
//     if(!item) return;
//     const objid = to_objid(item.id);
//     const session = driver.mongo_client.startSession();

//     try {
//       await session.withTransaction(
//         async () => {

//           ////
//           // PRODUCTS -> VARIANTS RELATION
//           ////
//           const is_variant = item?.parent_handle && item?.parent_id && item?.variant_hint;
//           if(is_variant) {
//             // remove me from parent
//             await driver.products._col.updateOne(
//               { _id : to_objid(item.parent_id) },
//               { 
//                 $pull: { '_relations.variants.ids': objid },
//                 $unset: { [`_relations.variants.entries.${objid.toString()}`]: '' },
//               },
//               { session }
//             );
//           } else {
//             // I am a parent, let's delete all of the children variants
//             const ids = item?._relations?.variants?.ids;
//             if(ids) {
//               await driver.products._col.deleteMany(
//                 { _id: { $in: ids } },
//                 { session }
//               );
//             }
//           }

//           ////
//           // STOREFRONTS --> PRODUCTS RELATION
//           ////
//           await driver.storefronts._col.updateMany(
//             { '_relations.products.ids' : objid },
//             { 
//               $pull: { '_relations.products.ids': objid, },
//               $unset: { [`_relations.products.entries.${objid.toString()}`]: '' },
//             },
//             { session }
//           );

//           // DELETE ME
//           const res = await col(driver).deleteOne(
//             { _id: objid },
//             { session }
//           );

//         }
//       );
//     } catch (e) {
//       console.log(e);
//       return false;
//     } finally {
//       await session.endSession();
//     }    

//     return true;
//   }

// }

// /**
//  * @param {MongoDB} driver 
//  */
// const list = (driver) => list_regular(driver, col(driver));


// /**
//  * For now and because each product is related to very few
//  * collections, I will not expose the query api, and use aggregate
//  * instead.
//  * @param {MongoDB} driver 
//  * @returns {db_col["list_product_collections"]}
//  */
// const list_product_collections = (driver) => {
//   return async (product) => {
//     /** @type {import('@storecraft/core').RegularGetOptions} */
//     const options = {
//       expand: ['collections']
//     };
//     // We have collections embedded in products, so let's use it
//     const item = await get_regular(driver, col(driver))(product, options);
//     return sanitize_array(item?.collections);
//   }
// }

// /**
//  * For now and because each product is related to very few
//  * collections, I will not expose the query api, and use aggregate
//  * instead.
//  * @param {MongoDB} driver 
//  * @returns {db_col["list_product_variants"]}
//  */
// const list_product_variants = (driver) => {
//   return async (product) => {
//     /** @type {import('@storecraft/core').RegularGetOptions} */
//     const options = {
//       expand: ['variants']
//     };
//     // We have collections embedded in products, so let's use it
//     const item = await get_regular(driver, col(driver))(product, options);
//     return sanitize_array(item?.variants);
//   }
// }

// /**
//  * @param {MongoDB} driver 
//  * @returns {db_col["list_product_discounts"]}
//  */
// const list_product_discounts = (driver) => {
//   return async (product) => {
//     /** @type {import('@storecraft/core').RegularGetOptions} */
//     const options = {
//       expand: ['discounts']
//     };
//     // We have collections embedded in products, so let's use it
//     const item = await get_regular(driver, col(driver))(product, options);
//     return sanitize_array(item?.discounts);
//   }
// }

// /**
//  * @param {MongoDB} driver 
//  * @returns {db_col["add_product_to_collection"]}
//  */
// const add_product_to_collection = (driver) => {
//   return async (product_id_or_handle, collection_handle_or_id) => {

//     // 
//     const coll = await driver.collections._col.findOne(
//       handle_or_id(collection_handle_or_id)
//     );

//     if(!coll)
//       return;

//     const objid = to_objid(coll.id);
//     await driver.products._col.updateOne(
//       handle_or_id(product_id_or_handle),
//       { 
//         $set: { [`_relations.collections.entries.${objid.toString()}`]: coll },
//         $addToSet: { 
//           '_relations.collections.ids': objid, 
//           search: { $each : [`col:${coll.handle}`, `col:${coll.id}`]} 
//         }
//       },
//     );

//   }
// }

// /**
//  * @param {MongoDB} driver 
//  * @returns {db_col["remove_product_from_collection"]}
//  */
// const remove_product_from_collection = (driver) => {
//   return async (product_id_or_handle, collection_handle_or_id) => {

//     // 
//     const coll = await driver.collections._col.findOne(
//       handle_or_id(collection_handle_or_id)
//     );
//     if(!coll)
//       return;

//     const objid = to_objid(coll.id);
//     await driver.products._col.updateOne(
//       handle_or_id(product_id_or_handle),
//       { 
//         $unset: { [`_relations.collections.entries.${objid.toString()}`]: '' },
//         $pull: { 
//           '_relations.collections.ids': objid, 
//           search: { $in : [`col:${coll.handle}`, `col:${coll.id}`]} 
//         }
//       },
//     );

//   }
// }

// /** 
//  * @param {MongoDB} driver
//  * @return {db_col & { _col: ReturnType<col> }}
//  */
// export const impl = (driver) => {

//   return {
//     _col: col(driver),
//     get: get(driver),
//     getBulk: get_bulk(driver, col(driver)),
//     upsert: upsert(driver),
//     remove: remove(driver),
//     list: list(driver),
//     add_product_to_collection: add_product_to_collection(driver),
//     remove_product_from_collection: remove_product_from_collection(driver),
//     list_product_collections: list_product_collections(driver),
//     list_product_variants: list_product_variants(driver),
//     list_product_discounts: list_product_discounts(driver),
//   }
// }
 