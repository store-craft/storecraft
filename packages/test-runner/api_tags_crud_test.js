import 'dotenv/config';
import { tags } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws } from './utils.js';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

const handle_tag = create_handle('tag', file_name(import.meta.url));

/** @type {import('@storecraft/core').TagTypeUpsert[]} */
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

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: tags }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await tags.remove(app, p.handle);
      } catch(e) {
        // console.log(e)
        throw e;
      }

      console.log('before DONE')
    }
  );

  // return s;
  add_sanity_crud_to_test_suite(s);


  s('upsert tag with bad handle', async () => {
    /** @type {import('@storecraft/core').TagTypeUpsert} */
    const tag_insert = {
      handle: 'tag 2', values:['a', 'b']
    }
    await assert_async_throws(
      async () => await tags.upsert(app, {
        handle: 'tag 2', values: ['a', 'b']
      })
    );

    await assert_async_throws(
      async () => await tags.upsert(app, {
        handle: 'tag-2', values: ['a c', 'b']
      })
    );

  })

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
