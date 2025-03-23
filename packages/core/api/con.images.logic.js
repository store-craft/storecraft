/**
 * @import { ApiQuery, BaseType, ImageType, ImageTypeUpsert } from './types.public.js'
 */
import { ID, apply_dates, to_handle } from './utils.func.js'
import { imageTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list } from './con.shared.js'
import { create_search_index } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';
import { App } from '../index.js';


/**
 * @param {App} app
 */
export const db = app => app.db.resources.images;
 
/**
 * 
 * @param {App} app
 */
export const upsert = (app) => 
/**
 * @description `upsert` a `image`
 * @param {ImageTypeUpsert} item
 */
async (item) => {
  const requires_event_processing = app.pubsub.has('images/upsert');

  assert_zod(imageTypeUpsertSchema, item);

  // Check if exists
  const id = !Boolean(item.id) ? ID('img') : item.id;
  // search index
  let search = create_search_index(item);
  // apply dates and index
  const final = apply_dates(
    { 
      ...item, 
      handle: to_handle(decodeURIComponent(item.name)),
      id 
    }
  );

  await db(app).upsert(final, search);

  if(requires_event_processing) {
    await app.pubsub.dispatch(
      'images/upsert',
      {
        current: final,
        previous: undefined
      }
    )
  }

  return final.id;
}


/**
 * @param {App} app
 */
export const remove = (app) => 
/**
 * @description `remove` a `image`
 * @param {string} id
 */
async (id) => {
  // remove from storage
  const img = await regular_get(app, db(app))(id);

  if(!img) 
    return;

  // remove from storage if it belongs
  if(app.storage && img.url.startsWith('storage://'))
    await app.storage.remove(img.url.substring('storage://'.length));

  // db remove image side-effect
  const success = await app.db.resources.images.remove(img.id);

  await app.pubsub.dispatch(
    'images/remove',
    {
      previous: img, 
      success
    }
  );

  return success;
}

/**
 * @description url to name
 * @param {string} url 
 */
export const image_url_to_name = url => 
  decodeURIComponent(String(url)).split('/').pop().split('?')[0];

/**
 * @description url to handle
 * @param {string} url 
 */
export const image_url_to_handle = url => to_handle(image_url_to_name(url));

/**
 * @description report media usages
 * @param {App} app
 * @param {BaseType} data data being reported
 */
export const reportSearchAndUsageFromRegularDoc = async (app, data) => {
  await db(app).report_document_media(data)
}

/**
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<ImageType>} query 
   */
  (query) => {
    return db(app).count(query);
  }


/**
 * @param {App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'images/get'),
    upsert: upsert(app),
    remove: remove(app),
    list: regular_list(app, db(app), 'images/list'),
    count: count(app),
  }
}