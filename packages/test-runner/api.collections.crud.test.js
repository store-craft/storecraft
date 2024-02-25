import 'dotenv/config';
import { collections } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';

const app = await create_app();

/** @type {import('@storecraft/core').CollectionTypeUpsert[]} */
const items_upsert = [
  {
    active: true,
    handle: 'col-crud-1',
    title: 'col 1',
    tags: ['tag-1_a', 'tag-1_b']
  },
  {
    active: true,
    handle: 'col-crud-2',
    title: 'col 2',
    tags: ['tag-1_a', 'tag-1_b']
  },
  {
    active: true,
    handle: 'col-crud-3',
    title: 'col 3',
    tags: ['tag-1_a', 'tag-1_b']
  },
]

const s = suite(
  file_name(import.meta.url), 
  { items: items_upsert, app, ops: collections }
);

s.before(
  async () => { 
    assert.ok(app.ready) 
    try {
      for(const p of items_upsert)
        await collections.remove(app, p.handle);
    } catch(e) {
      console.log(e)
      throw e;
    }

    console.log('before DONE')
  }
);

s.after(async () => { await app.db.disconnect() });

add_sanity_crud_to_test_suite(s).run();

