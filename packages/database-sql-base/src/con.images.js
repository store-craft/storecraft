import { func, images } from '@storecraft/core/v-api'
import { SQL } from '../driver.js'
import { delete_me, delete_search_of, 
  insert_entity_array_values_of, 
  insert_search_of, upsert_me, where_id_or_handle_table 
} from './con.shared.js'
import { sanitize_array, sanitize } from './utils.funcs.js'
import { query_to_eb, query_to_sort } from './utils.query.js'
// import { ID } from '@storecraft/core/v-api/utils.func.js'
import { Transaction } from 'kysely'
import { ID } from '@storecraft/core/v-api/utils.func.js'

/**
 * @typedef {import('@storecraft/core/v-database').db_images} db_col
 */
export const table_name = 'images'

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
          await insert_search_of(trx, item.search, item.id, item.handle, table_name);
          await upsert_me(trx, table_name, item.id, {
            created_at: item.created_at,
            updated_at: item.updated_at,
            id: item.id,
            handle: item.handle,
            name: item.name,
            url: item.url,
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
    const img = await driver.client
    .selectFrom(table_name)
    .selectAll()
    .where(where_id_or_handle_table(id_or_handle))
    .executeTakeFirst();

    try {
      await driver.client.transaction().execute(
        async (trx) => {
          // remove images -> media
          await trx
            .deleteFrom('entity_to_media')
            .where('value', '=', img.url)
            .execute();
          // entities
          await delete_search_of(trx, id_or_handle);
          // delete me
          await delete_me(trx, table_name, id_or_handle);
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
 * report media usages
 * @param {SQL} driver 
 * @returns {db_col["report_document_media"]}
 */
export const report_document_media = (driver) => {
  /**
   * @param {Transaction<import('../index.js').Database>} [transaction]
   */
  return async (item, transaction) => {
    if(!(item?.media?.length))
      return;
  
    /**
     * 
   * @param {Transaction<import('../index.js').Database>} trx
     */
    const doit = async (trx) => {
      const dates = func.apply_dates({});

      const ms = item.media.map(
        m => (
          {
            handle: images.image_url_to_handle(m),
            url: m,
            name: images.image_url_to_name(m),
            id: ID('img'),
            created_at: dates.created_at,
            updated_at: dates.updated_at,
          }
        )
      );
      const handles = ms.map(m => m.handle);

      await trx.deleteFrom(table_name).where(
        'handle', 'in', handles
      ).execute();
      await trx.insertInto(table_name).values(
        ms
      ).execute();
      // search stuff
      // remove by reporter
      await trx.deleteFrom('entity_to_search_terms').where(
        eb => eb.and([
            eb('reporter', '=', item.id),
            eb('context', '=', table_name),
          ]
        )
      ).execute();
      const search = func.union(
        item['title'], func.to_tokens(item['title'])
      );
      if(search.length) {
        const A = ms.map(m => ({
            entity_id: m.id,
            entity_handle: m.handle,
            context: table_name,
            reporter: item.id
          })
        );

        const B = search.reduce(
          (p, c) => {
            p.push(...A.map(a => ({...a, value: c})));
            return p;
          }, []
        );
      
        await trx.insertInto('entity_to_search_terms').values(
          B
        ).execute();
      }
      
    }

    if(transaction) {
      await doit(transaction);
    } else {
      try {
        const t = await driver.client
          .transaction()
          .execute(doit);
      } catch(e) {
        console.log(e);
      }
    }
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
      .where(
        (eb) => {
          return query_to_eb(eb, query, table_name).eb;
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
    list: list(driver),
    report_document_media: report_document_media(driver)

  }
}


// import { Collection } from 'mongodb'
// import { get_regular, list_regular, 
//   upsert_regular } from './con.shared.js'
// import { handle_or_id } from './utils.funcs.js';
// import { images, func } from '@storecraft/core/v-api';

// /**
//  * @typedef {import('@storecraft/core').db_images} db_col
//  */

// /**
//  * @param {MongoDB} d @returns {Collection<db_col["$type_get"]>}
//  */
// const col = (d) =>  d.collection('images');

// /**
//  * @param {MongoDB} driver 
//  */
// const upsert = (driver) => upsert_regular(driver, col(driver));

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
//     const image = await col(driver).findOne(handle_or_id(id));
//     if(!image) return;

//     const session = driver.mongo_client.startSession();
//     try {
//       await session.withTransaction(
//         async () => {
//           ////
//           // EVERYTHING --> IMAGES URL
//           ////
//           const filter = { media : image.url };
//           const update = { $pull: { media: image.url } };
//           const options = { session };

//           await Promise.all(
//             [
//               driver.collections._col.updateMany(filter, update, options),
//               driver.discounts._col.updateMany(filter, update, options),
//               driver.posts._col.updateMany(filter, update, options),
//               driver.products._col.updateMany(filter, update, options),
//               driver.shipping._col.updateMany(filter, update, options),
//               driver.storefronts._col.updateMany(filter, update, options),
//             ]
//           );

//           // DELETE ME
//           const res = await col(driver).deleteOne( 
//             { _id: image._id },
//             options
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
//  * report media usages
//  * @param {MongoDB} driver 
//  * @returns {db_col["report_document_media"]}
//  */
// export const report_document_media = (driver) => {
//   return async (data, session) => {
//     if(!(data?.media?.length))
//       return;

//     const add_to_search_index = func.union(
//       data['title'], func.to_tokens(data['title'])
//     );

//     const dates = func.apply_dates({});
    
//     /** 
//      * @param {string} url 
//      * @returns {import('mongodb').AnyBulkWriteOperation<import('@storecraft/core').ImageType>}
//      */
//     const url_to_update = url => {
//       return {
//         updateOne: {
//           filter: { handle: images.image_url_to_handle(url) },
//           update: { 
//             $addToSet : { search: { $each: add_to_search_index} },
//             $set: { 
//               name: images.image_url_to_name(url),
//               url: url,
//               updated_at: dates.updated_at
//             },
//             $setOnInsert: { created_at: dates.created_at }
//           },
//           upsert: true
//         }
//       }
//     }

//     const ops = data.media.map(url_to_update);

//     await driver.images._col.bulkWrite(
//       ops, { session }
//     );

//   }
// }

// /**
//  * @param {MongoDB} driver 
//  */
// const list = (driver) => list_regular(driver, col(driver));

// /** 
//  * @param {MongoDB} driver
//  * @return {db_col & { _col: ReturnType<col>}}
//  * */
// export const impl = (driver) => {

//   return {
//     _col: col(driver),
//     get: get(driver),
//     upsert: upsert(driver),
//     remove: remove(driver),
//     list: list(driver),
//     report_document_media: report_document_media(driver)
//   }
// }
