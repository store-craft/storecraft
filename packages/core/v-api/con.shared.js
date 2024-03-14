import { ID, apply_dates, assert } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { create_search_index } from './utils.index.js'
import { ZodSchema } from 'zod'

/**
 * @typedef {import('./types.api.js').searchable} searchable
 * @typedef {import('./types.api.js').BaseType} ItemType
 * @typedef {import('../v-database/types.public.js').RegularGetOptions} RegularGetOptions
 */

/**
 * This type of upsert might be uniform and re-occurring, so it is
 * refactored. There is a hook to add more functionality.
 * 
 * @template {import('./types.api.js').BaseType} T
 * @template {import('./types.api.js').BaseType} G
 * @param {import("../types.public.js").App} app app instance
 * @param {import("../v-database/types.public.js").db_crud<T & {id:string}, G>} db db instance
 * @param {string} id_prefix
 * @param {ZodSchema} schema
 * @param {<H extends T>(final: H) => string[]} hook hook into final state, returns extra search terms
 */
export const regular_upsert = (app, db, id_prefix, schema, hook=x=>[]) => {

  /**
   * @param {T} item
   */
  return async (item) => {
    schema && assert_zod(schema, item);

    // Check if exists
    await assert_save_create_mode(item, db);
    const id = !Boolean(item.id) ? ID(id_prefix) : item.id;
    const final = apply_dates({ ...item, id })
    const search = [
      ...create_search_index(final), 
      ...hook(final)
    ];

    const success = await db.upsert(final, search);
    assert(success, 'upsert-failed', 400);
    return final.id;
  }
}

/**
  * @template {import('../v-database/types.public.js').idable_concrete} T 
 * @template G
 * @param {import("../types.public.js").App} app
 * @param {import("../v-database/types.public.js").db_crud<T, G>} db
*/
export const regular_get = (app, db) => /**
  * 
  * @param {string} handle_or_id 
  * @param {RegularGetOptions} [options] 
  */
  async (handle_or_id, options) => {
    const item = await db.get(handle_or_id, options);
    return item;
  };

/**
 * @template {import('../v-database/types.public.js').idable_concrete} T 
 * @template G
 * @param {import("../types.public.js").App} app
 * @param {import("../v-database/types.public.js").db_crud<T, G>} db
 */
export const regular_remove = (app, db) => 
  /**
   * 
   * @param {string} id 
   */
  async (id) => {
    return db.remove(id);
  }

/**
 * @template {import('../v-database/types.public.js').idable_concrete} T 
 * @template G
 * @param {import("../types.public.js").App} app
 * @param {import("../v-database/types.public.js").db_crud<T, G>} db
 */
export const regular_list = (app, db) => 
  /**
   * @param {import('./types.api.query.js').ApiQuery} q 
   */
  async (q) => {
    return db.list(q);
  }

/**
 * @template {import('../v-database/types.public.js').idable_concrete} T
 * @template {import("./types.api.js").BaseType} G
 * @param {import("./types.api.js").BaseType} item 
 * @param {import("../v-database/types.public.js").db_crud<T, G>} db 
 */
export const assert_save_create_mode = async (item, db) => {
  // Check if tag exists
  const save_mode = Boolean(item.id)
  const prev_item = await db.get(item.id ?? item.handle);

  if(save_mode) {
    assert(
      prev_item, 
      `Item with id \`${item?.id}\` doesn't exist !`, 400);
    item.handle && assert(
      prev_item?.handle===item.handle, 
      `Item with id \`${prev_item?.id}\` has a handle \`${prev_item?.handle}!=${item.handle}\` !`, 400
    );
  } else { // create mode
    if(item.handle)
      assert(
        !prev_item, 
        `Handle \`${prev_item?.handle}\` already exists!`, 400
      );
  }

}