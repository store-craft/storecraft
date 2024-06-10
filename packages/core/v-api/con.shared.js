import { ID, apply_dates, assert } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { create_search_index } from './utils.index.js'
import { ZodSchema } from 'zod'
import { 
  rewrite_media_from_storage, rewrite_media_to_storage 
} from './con.storage.logic.js'

/**
 * @typedef {import('./types.api.js').searchable} searchable
 * @typedef {import('./types.api.js').BaseType} ItemType
 * @typedef {import('../v-database/types.public.js').RegularGetOptions} RegularGetOptions
 */

/**
 * @description This type of upsert might be uniform and re-occurring, so it is
 * refactored. There is a hook to add more functionality.
 * 
 * @template {Partial<import('./types.api.js').BaseType>} G
 * @template {Partial<import('./types.api.js').BaseType>} U
 * 
 * 
 * @param {import("../types.public.js").App} app app instance
 * @param {import("../v-database/types.public.js").db_crud<
 *  import('../v-database/types.public.js').withConcreteId<U>, 
 *  import('../v-database/types.public.js').withConcreteId<G>
 * >} db db instance
 * @param {string} id_prefix
 * @param {ZodSchema} schema
 * @param {<H extends U>(final: H) => H} pre_hook Hook before validation, this is 
 * your chance to fill gaps in data
 * @param {<H extends U>(final: H) => string[]} post_hook 
 * hook into final state, returns extra search terms
 * @param {import('../v-pubsub/types.public.js').PubSubEvent} [event] keep 
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
   * @param {U} item
   */
  return async (item) => {
    const requires_event_processing = Boolean(event) && app.pubsub.has(event);

    /** @type {import('../v-database/types.public.js').withConcreteId<G>} */
    let previous_item;

    item = pre_hook(item);
    
    schema && assert_zod(
      schema.transform(x => x ?? undefined), 
      item
    );

    // fetch previous item from the database
    if(requires_event_processing) {
      if(item?.id)
        previous_item = await db.get(item.id)
    }

    // Check if exists
    const id = !Boolean(item.id) ? ID(id_prefix) : item.id;
    const final = apply_dates({ ...item, id })
    const search = [
      ...create_search_index(final), 
      ...post_hook(final)
    ];

    rewrite_media_to_storage(app)(item);

    const success = await db.upsert(final, search);

    assert(success, 'upsert-failed', 400);

    // dispatch event
    if(requires_event_processing) {
      await app.pubsub.dispatch(
        event,
        {
          previous: previous_item, 
          current: final,
        }
      );
    }

    return final.id;
  }
}

/**
 * @description a regular document fetch
 * 
 * @template {Partial<import('./types.api.js').BaseType>} G
 * @template {Partial<import('./types.api.js').BaseType>} U
 * 
 * 
 * @param {import("../types.public.js").App} app
 * @param {import("../v-database/types.public.js").db_crud<
 *  import('../v-database/types.public.js').withConcreteId<U>, 
 *  import('../v-database/types.public.js').withConcreteId<G>
 * >} db db instance
 * @param {import('../v-pubsub/types.public.js').PubSubEvent} [event] keep 
 * `undefined` to avoid event processing
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
        event,
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
 * @template {Partial<import('./types.api.js').BaseType>} G
 * @template {Partial<import('./types.api.js').BaseType>} U
 * 
 * 
 * @param {import("../types.public.js").App} app
 * @param {import("../v-database/types.public.js").db_crud<
 *  import('../v-database/types.public.js').withConcreteId<U>, 
 *  import('../v-database/types.public.js').withConcreteId<G>
 * >} db db instance
 * @param {import('../v-pubsub/types.public.js').PubSubEvent} [event] keep 
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

    /** @type {import('../v-database/types.public.js').withConcreteId<G>} */
    let previous;

    // fetch item before removal
    if(requires_event_processing) {
      previous = await db.get(id);
    }

    const success = await db.remove(id);

    if(requires_event_processing) {
      await app.pubsub.dispatch(
        event,
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
 * @template {Partial<import('./types.api.js').BaseType>} G
 * @template {Partial<import('./types.api.js').BaseType>} U
 * 
 * 
 * @param {import("../types.public.js").App} app
 * @param {import("../v-database/types.public.js").db_crud<
 *  import('../v-database/types.public.js').withConcreteId<U>, 
 *  import('../v-database/types.public.js').withConcreteId<G>
 * >} db db instance
 * @param {import('../v-pubsub/types.public.js').PubSubEvent} [event] keep 
 * `undefined` to avoid event processing
 * 
 */
export const regular_list = (app, db, event) => 
  /**
   * @param {import('./types.api.query.js').ApiQuery} q 
   */
  async (q={}) => {
    // console.log('query', q);

    const items = await db.list(
      {
        ...q,
        expand: q.expand ?? ['*']
      }
    );

    rewrite_media_from_storage(app)(items);

    if(Boolean(event)) {
      await app.pubsub.dispatch(
        event,
        {
          current: items,
        }
      );
    }

    return items;
  }

