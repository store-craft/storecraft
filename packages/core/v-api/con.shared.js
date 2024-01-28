import { ID, assert } from "./utils.func.js";

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