import { Collection } from 'mongodb'
import { MongoDB } from '../driver.js'
import { get_regular, list_regular, 
  upsert_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js';
import { images, func } from '@storecraft/core/v-api';
import { ID } from '@storecraft/core/v-api/utils.func.js';

/**
 * @typedef {import('@storecraft/core/v-database').db_images} db_col
 */

/**
 * @param {MongoDB} d @returns {Collection<db_col["$type_get"]>}
 */
const col = (d) =>  d.collection('images');

/**
 * @param {MongoDB} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

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
    const image = await col(driver).findOne(handle_or_id(id));
    if(!image) return;

    const session = driver.mongo_client.startSession();
    try {
      await session.withTransaction(
        async () => {
          ////
          // EVERYTHING --> IMAGES URL
          ////
          const filter = { media : image.url };
          const update = { $pull: { media: image.url } };
          const options = { session };

          await Promise.all(
            [
              driver.collections._col.updateMany(filter, update, options),
              driver.discounts._col.updateMany(filter, update, options),
              driver.posts._col.updateMany(filter, update, options),
              driver.products._col.updateMany(filter, update, options),
              driver.shipping._col.updateMany(filter, update, options),
              driver.storefronts._col.updateMany(filter, update, options),
            ]
          );

          // DELETE ME
          const res = await col(driver).deleteOne( 
            { _id: image._id },
            options
          );
        }
      );
    } catch(e) {
      console.log(e);
      return false;
    } finally {
      await session.endSession();
    }

    return true;
  }

}

/**
 * report media usages
 * @param {MongoDB} driver 
 * @returns {db_col["report_document_media"]}
 */
export const report_document_media = (driver) => {
  return async (data, session) => {
    if(!(data?.media?.length))
      return;

    const add_to_search_index = func.union(
      data['title'], func.to_tokens(data['title'])
    );

    const dates = func.apply_dates({});
    
    /** 
     * @param {string} url 
     * @returns {import('mongodb').AnyBulkWriteOperation<import('@storecraft/core/v-api').ImageType>}
     */
    const url_to_update = url => {
      const id_on_insert = ID('img');
      return {
        updateOne: {
          filter: { handle: images.image_url_to_handle(url) },
          update: { 
            $addToSet : { '_relations.search': { $each: add_to_search_index} },
            $set: { 
              name: images.image_url_to_name(url),
              url: url,
              updated_at: dates.updated_at
            },
            $setOnInsert: { 
              created_at: dates.created_at,
              _id: to_objid(id_on_insert),
              id: id_on_insert
            }
          },
          upsert: true
        }
      }
    }

    const ops = data.media.map(url_to_update);

    await driver.images._col.bulkWrite(
      ops, { session }
    );

  }
}

/**
 * @param {MongoDB} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/** 
 * @param {MongoDB} driver
 * @return {db_col & { _col: ReturnType<col>}}
 * */
export const impl = (driver) => {

  return {
    _col: col(driver),
    get: get(driver),
    upsert: upsert(driver),
    remove: remove(driver),
    list: list(driver),
    report_document_media: report_document_media(driver)
  }
}
