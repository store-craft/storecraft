import { ID, apply_dates, assert } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { create_search_index } from './utils.index.js'
import { ZodSchema } from 'zod'

/**
 * @typedef {import('../types.api.js').BaseType} ItemType
 * @typedef {import('../types.driver.js').RegularGetOptions} RegularGetOptions
 */

/**
 * This type of upsert might be uniform and re-occurring, so it is
 * refactored. There is a hook to add more functionality.
 * 
 * @template {import('../types.api.js').BaseType} T
 * @param {import("../types.public.js").App} app
 * @param {import("../types.driver").db_crud} db
 * @param {string} id_prefix
 * @param {ZodSchema} schema
 * @param {(final: T) => Promise<T>} hook hook into final state
 */
export const regular_upsert = (app, db, id_prefix, schema, hook=async x=>x) => {

  /**
   * @param {T} item
   */
  return async (item) => {
    schema && assert_zod(schema, item);

    // Check if exists
    await assert_save_create_mode(item, db);
    const id = !Boolean(item.id) ? ID(id_prefix) : item.id;
    // search index
    let search = create_search_index(item);
    // apply dates and index
    const final = await hook(
      apply_dates(
        { 
          ...item, id, search
        }
      )
    );

    await db.upsert(final);
    return final;
  }
}

/**
 * @template {import('../types.api.js').BaseType} T
 * @param {import("../types.public.js").App} app
 * @param {import("../types.driver").db_crud<T>} db
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
 * @template {import('../types.api.js').BaseType} T
 * @param {import("../types.public.js").App} app
 * @param {import("../types.driver").db_crud<T>} db
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
 * @template {import('../types.api.js').BaseType} T
 * @param {import("../types.public.js").App} app
 * @param {import("../types.driver").db_crud<T>} db
 */
export const regular_list = (app, db) => 
  /**
   * @param {import('../types.api.query.js').ParsedApiQuery} q 
   */
  async (q) => {
    return db.list(q);
  }

/**
 * @template {import("../types.api").BaseType} T
 * @param {import("../types.api").BaseType} item 
 * @param {import("../types.driver").db_crud<T>} db 
 */
export const assert_save_create_mode = async (item, db) => {
  // Check if tag exists
  const save_mode = Boolean(item.id)
  const prev_item = await db.get(item.id ?? item.handle);

  if(save_mode) {
    assert(
      prev_item, 
      `Item with id \`${item?.id}\` doesn't exist !`, 400);
    assert(
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