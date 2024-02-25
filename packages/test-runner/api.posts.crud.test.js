import 'dotenv/config';
import { posts } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';

const app = await create_app();

/** @type {import('@storecraft/core').PostTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'post-1', title: 'post 1', text: 'blah blah 1'
  },
  {
    handle: 'post-2', title: 'post 2', text: 'blah blah 2'
  },
  {
    handle: 'post-3', title: 'post 3', text: 'blah blah 3'
  },
]

const s = suite(
  file_name(import.meta.url), 
  { items: items_upsert, app, ops: posts }
);

s.before(
  async () => { 
    assert.ok(app.ready) 
    try {
      for(const p of items_upsert)
        await posts.remove(app, p.handle);
    } catch(e) {
      console.log(e)
      throw e;
    }

    console.log('before DONE')
  }
);

s.after(async () => { await app.db.disconnect() });

add_sanity_crud_to_test_suite(s).run();

