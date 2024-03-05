import { SQL } from '../driver.js'
import { discount_to_conjunctions } from './con.discounts.utils.js'
import { delete_entity_values_by_value_or_reporter, delete_entity_values_of_by_entity_id_or_handle, delete_me, delete_media_of, delete_search_of, 
  delete_tags_of, insert_media_of, insert_search_of, 
  insert_tags_of, upsert_me, where_id_or_handle_table, 
  with_media, with_tags} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'

/**
 * @typedef {import('@storecraft/core').db_discounts} db_col
 */
export const table_name = 'discounts'

/**
 * @param {SQL} driver 
 * @returns {db_col["upsert"]}
 */
const upsert = (driver) => {
  return async (item) => {
    const c = driver.client;
    try {
      const t = await c.transaction().execute(
        async (trx) => {
          /// ENTITIES
          await insert_search_of(trx, item.search, item.id, item.handle);
          await insert_media_of(trx, item.media, item.id, item.handle);
          await insert_tags_of(trx, item.tags, item.id, item.handle);
          //
          // PRODUCTS => DISCOUNTS
          //
          // delete old connections of discount
          await delete_entity_values_by_value_or_reporter('products_to_discounts')(
            trx, item.id, item.handle);
          // INSERT INTO SELECT FROM
          await trx
            .insertInto('products_to_discounts')
            .columns(['entity_handle', 'entity_id', 'value', 'reporter'])
            .expression(eb => 
              eb.selectFrom('products')
                .select(eb => [
                  'handle as entity_handle',
                  'id as entity_id',
                  eb.val(item.id).as('value'),
                  eb.val(item.handle).as('reporter')
                  ]
                )
                .where(
                  eb => eb.and(discount_to_conjunctions(eb, item))
                )
            ).execute();

          ///
          /// SAVE ME
          ///
          await upsert_me(trx, table_name, item.id, {
            active: item.active ? 1: 0,
            attributes: JSON.stringify(item.attributes),
            description: item.description,
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            title: item.title, 
            priority: item.priority ?? 0,
            published: item.published,
            application: JSON.stringify(item.application),
            info: JSON.stringify(item.info),
          });
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
    const r = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, id_or_handle),
        with_tags(eb, id_or_handle),
      ].filter(Boolean))
      .where(where_id_or_handle_table(id_or_handle))
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
          await delete_search_of(trx, id_or_handle);
          await delete_media_of(trx, id_or_handle);
          await delete_tags_of(trx, id_or_handle);
          // delete products -> discounts
          await delete_entity_values_by_value_or_reporter('products_to_discounts')(
            trx, id_or_handle, id_or_handle);

          // delete me
          const d2 = await delete_me(trx, table_name, id_or_handle);
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

    const items = await driver.client
      .selectFrom(table_name)
      .selectAll()
      .select(eb => [
        with_media(eb, eb.ref('discounts.id')),
        with_tags(eb, eb.ref('discounts.id')),
      ].filter(Boolean))
      .where(
        (eb) => {
          return query_to_eb(eb, query).eb;
        }
      )
      .orderBy(query_to_sort(query))
      .limit(query.limit ?? 10)
      .execute();

    return sanitize_array(items);
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
    list: list(driver)
  }
}


// import { Collection } from 'mongodb'
// import { MongoDB } from '../driver.js'
// import { expand, get_bulk, get_regular, list_regular } from './con.shared.js'
// import { handle_or_id, isDef, sanitize_array, to_objid } from './utils.funcs.js'
// import { discount_to_mongo_conjunctions } from './con.discounts.utils.js'
// import { query_to_mongo } from './utils.query.js'
// import { report_document_media } from './con.images.js'
// import { DiscountApplicationEnum } from '@storecraft/core'

// /**
//  * @typedef {import('@storecraft/core').db_discounts} db_col
//  */

// /**
//  * @param {MongoDB} d 
//  * @returns {Collection<db_col["$type_get"]>}
//  */
// const col = (d) => d.collection('discounts');

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
//           // PRODUCT --> DISCOUNTS RELATION
//           ////

//           // first remove discount from anywhere
//           await driver.products._col.updateMany(
//             { '_relations.discounts.ids' : objid },
//             { 
//               $pull: { 
//                 '_relations.discounts.ids': objid,
//                 search: { $in : [ `discount:${data.handle}`, `discount:${data.id}` ] }
//               },
//               $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
//             },
//             { session }
//           );

//           // now filter and update for products
//           if(data.active && data.application.id===DiscountApplicationEnum.Auto.id) {
//             const conjunctions = discount_to_mongo_conjunctions(data);
//             if(conjunctions.length) {
//               await driver.products._col.updateMany(
//                 { $and: conjunctions },
//                 { 
//                   $set: { [`_relations.discounts.entries.${objid.toString()}`]: data },
//                   $addToSet: { 
//                     '_relations.discounts.ids': objid,
//                     search: { $each : [`discount:${data.handle}`, `discount:${data.id}`]} 
//                   },
                  
//                 },
//                 { session }
//               );
//             }
//           }

//           ////
//           // STOREFRONTS -> DISCOUNTS RELATION
//           ////
//           await driver.storefronts._col.updateMany(
//             { '_relations.discounts.ids' : objid },
//             { $set: { [`_relations.discounts.entries.${objid.toString()}`]: data } },
//             { session }
//           );

//           ////
//           // REPORT IMAGES USAGE
//           ////
//           await report_document_media(driver)(data, session);

//           // SAVE ME

//           const res = await col(driver).replaceOne(
//             { _id: objid }, {...data}, 
//             { session, upsert: true }
//           );

//         }
//       );
//     } catch(e) {
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
//   return async (id_or_handle) => {
//     const item = await col(driver).findOne(handle_or_id(id_or_handle));
//     if(!item) return;
//     const objid = to_objid(item.id)
//     const session = driver.mongo_client.startSession();

//     try {
//       await session.withTransaction(
//         async () => {
//           ////
//           // PRODUCT RELATION
//           ////
//           await driver.products._col.updateMany(
//             { '_relations.discounts.ids' : objid },
//             { 
//               $pull: { 
//                 '_relations.discounts.ids': objid,
//                 search: { $in : [ `discount:${item.handle}`, `discount:${item.id}` ] }
//               },
//               $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
//             },
//             { session }
//           );

//           ////
//           // STOREFRONTS --> DISCOUNTS RELATION
//           ////
//           await driver.storefronts._col.updateMany(
//             { '_relations.discounts.ids' : objid },
//             { 
//               $pull: { '_relations.discounts.ids': objid, },
//               $unset: { [`_relations.discounts.entries.${objid.toString()}`]: '' },
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
//     } catch(e) {
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
//  * @param {MongoDB} driver 
//  * @returns {db_col["list_discount_products"]}
//  */
// const list_discount_products = (driver) => {
//   return async (handle_or_id, query) => {

//     const { filter: filter_query, sort } = query_to_mongo(query);

//     // console.log('query', query)
//     // console.log('filter', JSON.stringify(filter_query, null, 2))
//     // console.log('sort', sort)
//     // console.log('expand', query?.expand)
    
//     const filter = {
//       $and: [
//         { search: `discount:${handle_or_id}` },
//       ]
//     };

//     // add the query filter
//     isDef(filter_query) && filter.$and.push(filter_query);

//     const items = await driver.products._col.find(
//       filter,  {
//         sort, limit: query.limit
//       }
//     ).toArray();

//     // try expand relations, that were asked
//     expand(items, query?.expand);

//     return sanitize_array(items);
//   }
// }

// /** 
//  * @param {MongoDB} driver
//  * @return {db_col & { _col: ReturnType<col>}}
//  * */
// export const impl = (driver) => {
//   driver
//   return {
//     _col: col(driver),
//     get: get(driver),
//     getBulk: get_bulk(driver, col(driver)),
//     upsert: upsert(driver),
//     remove: remove(driver),
//     list: list(driver),
//     list_discount_products: list_discount_products(driver)
//   }
// }
