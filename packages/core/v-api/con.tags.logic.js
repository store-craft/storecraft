import { assert, to_handle } from './utils.func.js'
import { tagTypeSchema } from './types.autogen.zod.api.js'
import { regular_get, regular_list, 
  regular_remove, regular_upsert } from './con.shared.js'

/**
 * @typedef {import('../types.api.js').TagType} ItemType
 */

/**
 * @param {import("../types.public.js").App} app
 */
export const db = app => app.db.tags;

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {ItemType} item
 */
export const upsert = (app, item) => regular_upsert(
  app, db(app), 'tag', tagTypeSchema, 
  /**
   * @param {ItemType} final 
   */
  async (final) => {
    assert(
      [final.handle, ...final.values].every(
        h => to_handle(h)===h
      ),
      'Handle or Values are invalid', 400
    );
    final.search?.push(...(final.values ?? []));
    return final;
  }
)(item);


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
export const remove = (app, id) => regular_remove(app, db(app))(id);

/**
 * 
 * @param {import("../types.public.js").App} app
 * @param {import('../types.api.query.js').ParsedApiQuery} q
 */
export const list = (app, q) => regular_list(app, db(app))(q);
