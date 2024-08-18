import { ID, apply_dates, to_handle } from './utils.func.js'
import { imageTypeUpsertSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list } from './con.shared.js'
import { create_search_index } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';

/**
 * @typedef {import('./types.api.d.ts').ImageType} ItemType
 * @typedef {import('./types.api.d.ts').ImageTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.d.ts").App} app
 */
export const db = app => app.db.resources.images;
 
/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const upsert = (app) => 
/**
 * 
 * @param {ItemTypeUpsert} item
 */
async (item) => {
  const requires_event_processing = app.pubsub.has('images/upsert');

  assert_zod(imageTypeUpsertSchema, item);

  item.handle = to_handle(decodeURIComponent(item.name));

  // Check if exists
  const id = !Boolean(item.id) ? ID('img') : item.id;
  // search index
  let search = create_search_index(item);
  // apply dates and index
  const final = apply_dates(
    { ...item, id }
  );

  await db(app).upsert(final, search);

  if(requires_event_processing) {
    await app.pubsub.dispatch(
      'images/upsert',
      {
        current: final
      }
    )
  }

  return final.id;
}


/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */
export const remove = (app) => 
/**
 * 
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
 * url to name
 * @param {string} url 
 */
export const image_url_to_name = url => 
  decodeURIComponent(String(url)).split('/').pop().split('?')[0];

/**
 * url to handle
 * @param {string} url 
 */
export const image_url_to_handle = url => to_handle(image_url_to_name(url));

/**
 * report media usages
 * @param {import("../types.public.d.ts").App} app
 * @param {import('./types.api.d.ts').BaseType} data data being reported
 */
export const reportSearchAndUsageFromRegularDoc = async (app, data) => {
  await db(app).report_document_media(data)
}


/**
 * 
 * @param {import("../types.public.d.ts").App} app
 */  
export const inter = app => {

  return {
    get: regular_get(app, db(app), 'images/get'),
    upsert: upsert(app),
    remove: remove(app),
    list: regular_list(app, db(app), 'images/list'),
  }
}