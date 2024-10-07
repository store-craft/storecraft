/**
 * @import { TagTypeUpsert } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * 
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws } from './utils.js';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle_tag = create_handle('tag', file_name(import.meta.url));

/** @type {TagTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle_tag(),
    values: ['a', 'b'],
  },
  {
    handle: handle_tag(),
    values: ['a', 'b'],
  },
  {
    handle: handle_tag(),
    values: ['a', 'b'],
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {import('uvu').Test<import('./api.utils.crud.js').CrudTestContext<>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.tags,
      events: {
        get_event: 'tags/get',
        upsert_event: 'tags/upsert',
        remove_event: 'tags/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await app.api.tags.remove(p.handle);
      } catch(e) {
        // console.log(e)
        throw e;
      }

    }
  );

  add_sanity_crud_to_test_suite(s);

  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('./play.js');
    const app = await create_app();
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
