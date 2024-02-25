import 'dotenv/config';
import { tags } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws, assert_partial, create_app } from './utils.js';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';

const app = await create_app();

/** @type {import('@storecraft/core').TagTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'col-1',
    values: ['a', 'b'],
  },
  {
    handle: 'col-2',
    values: ['a', 'b'],
  },
  {
    handle: 'col-3',
    values: ['a', 'b'],
  },
]

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
      console.log(e)
      throw e;
    }

    console.log('before DONE')
  }
);

s.after(async () => { await app.db.disconnect() });

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

s.run();
