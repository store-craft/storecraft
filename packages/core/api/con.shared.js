/**
 * @import {searchable, BaseType} from './types.api.js'
 * @import {RegularGetOptions, db_crud, withConcreteId} from '../database/types.public.js'
 * @import {PubSubEvent} from '../pubsub/types.public.js'
 * @import {ApiQuery} from './types.api.query.js'
 */

import { ID, apply_dates, assert } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { create_search_index } from './utils.index.js'
import { z, ZodSchema,  } from 'zod'
import { 
  rewrite_media_from_storage, rewrite_media_to_storage 
} from './con.storage.logic.js'
import { App } from '../index.js';


/**
 * @description This type of upsert might be uniform and re-occurring, so it is
 * refactored. There is a hook to add more functionality. The purpose is:
 * - Convert an API upsert schema of zod into Database Upsert type
 * 
 * @template {Partial<BaseType>} DB_GET_TYPE Database `get` type
 * @template {Partial<BaseType>} DB_UPSERT_TYPE Database `upsert` type
 * @template {ZodSchema} [API_UPSERT_ZOD_SCHEMA=ZodSchema] zod schema is the api upsert type
 * 
 * 
 * @param {App} app app instance
 * @param {db_crud<DB_UPSERT_TYPE, DB_GET_TYPE>} db db instance
 * @param {string} id_prefix
 * @param {API_UPSERT_ZOD_SCHEMA} schema
 * @param {<H extends z.infer<API_UPSERT_ZOD_SCHEMA>>(final: H) => H} pre_hook Hook before validation, this is 
 * your chance to fill gaps in data
 * @param {<H extends DB_UPSERT_TYPE>(final: DB_UPSERT_TYPE) => string[]} post_hook 
 * hook into final state, returns extra search terms
 * @param {PubSubEvent} [event] keep 
 * `undefined` to avoid event processing
 * 
 * 
 */
export const regular_upsert = (
  app, db, id_prefix, schema, 
  pre_hook=x=>x, post_hook=x=>[],
  event
) => {

  /**
   * @param {z.infer<API_UPSERT_ZOD_SCHEMA>} item
   * @returns {Promise<string>} id
   */
  return async (item) => {
    const requires_event_processing = Boolean(event) && app.pubsub.has(event);

    /** @type {DB_GET_TYPE} */
    let previous_item;

    item = pre_hook(item);
    
    schema && assert_zod(
      schema.transform(x => x ?? undefined), 
      item
    );

    // fetch previous item from the database
    if(requires_event_processing) {
      if(item?.id)
        previous_item = await db.get(item.id);
    }

    // Check if exists
    const id = !Boolean(item.id) ? ID(id_prefix) : String(item.id);
    const final = apply_dates({ ...item, id });
    const search = [
      ...create_search_index(final), 
      ...post_hook(final)
    ];

    rewrite_media_to_storage(app)(item);

    // dispatch event
    if(requires_event_processing) {
      await app.pubsub.dispatch(
        String(event),
        {
          previous: previous_item, 
          current: final,
        }
      );
    }

    const success = await db.upsert(final, search);

    assert(success, 'upsert-failed', 400);

    return final.id;
  }
}

/**
 * @description a regular document fetch
 * 
 * @template {Partial<BaseType>} G
 * @template {Partial<BaseType>} U
 * 
 * 
 * @param {App} app
 * @param {db_crud<U, G>} db db instance
 * @param {PubSubEvent} [event] keep `undefined` to avoid event processing
 * 
 */
export const regular_get = (app, db, event) => 
/**
  * 
  * @param {string} handle_or_id 
  * @param {RegularGetOptions} [options] 
  */
  async (handle_or_id, options={ expand: ['*'] }) => {
    const item = await db.get(handle_or_id, options);

    rewrite_media_from_storage(app)(item);

    if(Boolean(event)) {
      await app.pubsub.dispatch(
        String(event),
        {
          current: item,
        }
      );
    }

    return item;
  };

  
/**
 * @description a regular document removal
 * 
 * @template {Partial<BaseType>} G
 * @template {Partial<BaseType>} U
 * 
 * 
 * @param {App} app
 * @param {db_crud<U, G>} db db instance
 * @param {PubSubEvent} [event] keep 
 * `undefined` to avoid event processing
 * 
 */
export const regular_remove = (app, db, event) => 
  /**
   * 
   * @param {string} id 
   */
  async (id) => {
    const requires_event_processing = Boolean(event) && app.pubsub.has(event);

    /** @type {G} */
    let previous;

    // fetch item before removal
    if(requires_event_processing) {
      previous = await db.get(id);
    }

    const success = await db.remove(id);

    if(requires_event_processing) {
      await app.pubsub.dispatch(
        String(event),
        {
          previous,
          success
        }
      )
    }

    return success;
  }

/**
 * @description a regular document list with query operation
 * 
 * 
 * @template  G
 * @template  U
 * 
 * 
 * @param {App} app
 * @param {db_crud<U, G>} db db instance
 * @param {PubSubEvent} [event] keep 
 * `undefined` to avoid event processing
 * 
 */
export const regular_list = (app, db, event) => 
  /**
   * @param {ApiQuery<G>} q 
   */
  async (q={}) => {
    // console.log('query', q);

    const items = await db.list(
      {
        ...q,
        // @ts-ignore
        expand: q.expand ?? ['*']
      }
    );

    rewrite_media_from_storage(app)(items);

    if(Boolean(event)) {
      await app.pubsub.dispatch(
        String(event),
        {
          current: items,
        }
      );
    }

    return items;
  }

