import { ID, apply_dates, to_handle, to_tokens, union } from './utils.func.js'
import { imageTypeSchema } from './types.autogen.zod.api.js'
import { assert_save_create_mode,
  regular_get, regular_list } from './con.shared.js'
import { create_search_index } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';

/**
 * @typedef {import('../types.api.js').ImageType} ItemType
 * @typedef {import('../types.api.js').ImageTypeUpsert} ItemTypeUpsert
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.images;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemTypeUpsert} item
 */
export const upsert = async (app, item) => {
  assert_zod(imageTypeSchema, item);

  item.handle = to_handle(decodeURIComponent(item.name));

  // Check if exists
  await assert_save_create_mode(item, db(app));
  const id = !Boolean(item.id) ? ID('img') : item.id;
  // search index
  let search = create_search_index(item);
  // apply dates and index
  const final = apply_dates(
    { ...item, id, search }
  );

  await db(app).upsert(final);
  return final.id;
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 * @param {import('../types.database.js').RegularGetOptions} [options]
 */
export const get = (app, handle_or_id, options) => regular_get(app, db(app))(handle_or_id, options);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} id
 */
export const remove = async (app, id) => {
  // remove from storage
  const img = await get(app, id);
  if(!img) return;

  // remove from storage if it belongs
  if(app.storage && img.url.startsWith('storage://'))
    await app.storage.remove(img.url.substring('storage://'.length));

  // db remove image side-effect
  return app.db.images.remove(img.id);
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {import('../types.api.query.js').ParsedApiQuery} q
 */
export const list = (app, q) => regular_list(app, db(app))(q);

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
 * @param {import("../types.public.js").App} app
 * @param {import('../types.api.js').BaseType} data data being reported
 */
export const reportSearchAndUsageFromRegularDoc = async (app, data) => {
  await db(app).report_document_media(data)
}