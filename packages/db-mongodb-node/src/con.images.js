import { Collection } from 'mongodb'
import { Database } from '../driver.js'
import { get_regular, list_regular, 
  upsert_regular } from './con.shared.js'
import { handle_or_id } from './utils.funcs.js';
import { image_url_to_name, image_url_to_handle, 
  union, to_tokens, apply_dates } from '@storecraft/core/v-api';

/**
 * @typedef {import('@storecraft/core').db_images} db_col
 */

/**
 * @param {Database} d @returns {Collection<db_col["$type"]>}
 */
const col = (d) =>  d.collection('images');

/**
 * @param {Database} driver 
 */
const upsert = (driver) => upsert_regular(driver, col(driver));

/**
 * @param {Database} driver 
 */
const get = (driver) => get_regular(driver, col(driver));


/**
 * @param {Database} driver 
 * @returns {db_col["remove"]}
 */
const remove = (driver) => {
  return async (id) => {
    const image = await col(driver).findOne(handle_or_id(id));

    ////
    // EVERYTHING --> IMAGES URL
    ////
    const filter = { media : image.url };
    const update = { $pull: { media: image.url } };

    await Promise.all(
      [
        driver.collections._col.updateMany(filter, update),
        driver.discounts._col.updateMany(filter, update),
        driver.posts._col.updateMany(filter, update),
        driver.products._col.updateMany(filter, update),
        driver.shipping._col.updateMany(filter, update),
        driver.storefronts._col.updateMany(filter, update),
      ]
    );

    // DELETE ME
    const res = await col(driver).findOneAndDelete( 
      { _id: image._id }
    );

    return
  }

}

/**
 * report media usages
 * @param {Database} driver 
 * @returns {db_col["report_document_media"]}
 */
export const report_document_media = (driver) => {
  return async (data) => {
    if(!(data?.media?.length))
      return;

    const add_to_search_index = union(
      data['title'], to_tokens(data['title'])
    );

    const dates = apply_dates({});
    
    /** 
     * @param {string} url 
     * @returns {import('mongodb').AnyBulkWriteOperation<import('@storecraft/core').ImageType>}
     */
    const url_to_update = url => {
      return {
        updateOne: {
          filter: { handle: image_url_to_handle(url) },
          update: { 
            $addToSet : { search: { $each: add_to_search_index} },
            $set: { 
              name: image_url_to_name(url),
              url: url,
              updated_at: dates.updated_at
            },
            $setOnInsert: { created_at: dates.created_at }
          },
          upsert: true
        }
      }
    }

    const ops = data.media.map(url_to_update);

    await driver.images._col.bulkWrite(
      ops
    );

  }
}

/**
 * @param {Database} driver 
 */
const list = (driver) => list_regular(driver, col(driver));

/** 
 * @param {Database} driver
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
