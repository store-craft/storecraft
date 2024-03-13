import { ID } from '@storecraft/core/v-api/utils.func.js';
import { Collection } from '../data-api-client/index.js'
import { MongoDB } from '../driver.js'
import { get_regular, list_regular, 
  upsert_regular } from './con.shared.js'
import { handle_or_id, to_objid } from './utils.funcs.js';
import { images, func } from '@storecraft/core/v-api';

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

    try {
      ////
      // EVERYTHING --> IMAGES URL
      ////
      const filter = { media : image.url };
      const update = { $pull: { media: image.url } };

      await Promise.all(
        [
          driver.collections._col.updateMany(filter, update, false),
          driver.discounts._col.updateMany(filter, update, false),
          driver.posts._col.updateMany(filter, update, false),
          driver.products._col.updateMany(filter, update, false),
          driver.shipping._col.updateMany(filter, update, false),
          driver.storefronts._col.updateMany(filter, update, false),
        ]
      );

      // DELETE ME
      const res = await col(driver).deleteOne( 
        { _id: image._id },
      );
    } catch(e) {
      console.log(e);
      return false;
    } finally {
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
  return async (data) => {
    if(!(data?.media?.length))
      return;

    const add_to_search_index = func.union(
      data['title'], func.to_tokens(data['title'])
    );

    const dates = func.apply_dates({});
    
    /** 
     * @param {string} url 
     * @returns {import('mongodb').UpdateOneModel<import('@storecraft/core').ImageType>}
     */
    const url_to_update = url => {
      const id_on_insert = ID('img');
      return {
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

    const ops = data.media.map(
      url => {
        const op = url_to_update(url);
        
        return driver.images._col.updateOne(
          op.filter, op.update, op.upsert
        )
      }
    );

    await Promise.all(ops)
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
