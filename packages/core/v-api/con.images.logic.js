import { ID, apply_dates, assert, to_handle, to_tokens, union } from './utils.func.js'
import { imageTypeSchema } from './types.autogen.zod.api.js'
import { 
  assert_save_create_mode,
  regular_get, regular_list, 
  regular_remove } from './con.shared.js'
import { create_search_index, isDef } from './utils.index.js';
import { assert_zod } from './middle.zod-validate.js';

/**
 * @typedef {import('../types.api.js').ImageType} ItemType
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.images;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemType} item
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
    {
      ...item, id, search
    }
  );

  await db(app).upsert(final);
  return final;
}

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} handle_or_id
 * @param {import('../types.driver.js').RegularGetOptions} [options]
 */
export const get = (app, handle_or_id, options) => regular_get(app, db(app))(handle_or_id, options);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {string} id
 */
export const remove = async (app, id) => {
  // TODO: AFTER STORAGE
  const [exists, _, data] = await this.get(id)
    if(!exists)
      return;

    // 1. look at ref
    // - if this is missing, do nothing
    // - if this is gs://, use google storage for delete
    // - if this is s3, locate the correct setting and delete it
    // 2. remove url from usages
    // 3. remove image from database - this.db.col(NAME).remove(id)
    const { url, ref, usage } = data

    if(ref) {
      try {
        // First, delete from object storage
        await this.context.storage.deleteByRef(ref)
      } catch(e) {
        console.log(e)
      }
    }

    if(usage) {
      // second remove usages
        usage.forEach(
          async u => {
            const parts = u.split('/')
            const doc = parts.pop()
            const col = parts.join('/')
            const urls = []
            if(url) urls.push(url)
            if(ref) urls.push(ref)
            if(urls.length==0)
            return;

            try {
              await this.db.doc(col, doc).update(
                {
                  media: arrayRemove(...urls)
                }
              )
            } catch(e) {
              console.log(e)
            }
          }
        )
    }

    // Lastly, remove the image document
    await this.db.col(NAME).remove(id)
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
export const url2Name = url => 
  decodeURIComponent(String(url)).split('/').pop().split('?')[0];

/**
 * url to handle
 * @param {string} url 
 */
export const url2Handle = url => to_handle(url2Name(url));

/**
 * report media usages
 * @param {import("../types.public.js").App} app
 * @param {string} collection reporting collection
 * @param {string} id reporting id
 * @param {import('../types.api.js').BaseType} data data being reported
 */
export const reportSearchAndUsageFromRegularDoc = async (app, collection, id, data) => {
  data?.media?.forEach(
    async (m) => {
      // we do not await, we are willing to fail
      try {
        const name = url2Name(m);
        const handle = to_handle(url2Name(m));
        let img = await get(app, handle)
        img = img ?? {
          handle: handle,
          id: ID('img'),
          name: name,
          url: m,
          ref: undefined,
          search: [],
          usage: []
        }
        img.search = union(
          img.search, id,
          data['title'], to_tokens(data['title'])
        );

        img.usage = union(
          img.usage, 
          `${collection}/${id}`
        )

        apply_dates(img);
        
        await db(app).upsert(img);
      } catch (e) {
        console.log(e)
      }
    }
  )
}