import 'dotenv/config';
import { products, collections } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_list_integrity_tests} from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';
import { ID } from '@storecraft/core/v-api/utils.func.js';

const handle_col = create_handle('col', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/**
 * @typedef {import('@storecraft/core/v-database').idable_concrete} idable_concrete
 */
/** @type {(import('@storecraft/core/v-api').ProductType & idable_concrete)[]} */
const items = Array.from({length: 10}).map(
  (_, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      title: `product ${ix}`, 
      price: 50,
      active: true,
      qty: 1,
      handle: handle_pr(),
      id: ID('pr'),
      tags: [`tag_${ix}`],
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1)
    }
  }
);

/** @type {(import('@storecraft/core/v-api').CollectionType & idable_concrete)[]} */
const collections_upsert = [
  {
    active: true,
    handle: handle_col(),
    id: ID('col'),
    title: 'col 1',
    tags: ['tag-1_a', 'tag-1_b']
  },
  {
    active: true,
    handle: handle_col(),
    id: ID('col'),
    title: 'col 2',
    tags: ['tag-1_a', 'tag-1_b']
  },
]


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items, app, ops: products }
  );

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of collections_upsert) {
          await collections.remove(app, p.handle);
          await app.db.collections.upsert(p);
        }

        for(const p of items) {
          await products.remove(app, p.handle);
          // add collections
          p.collections = collections_upsert;
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.db.products.upsert(p);
        }
      } catch(e) {
        console.log(e)
        throw e;
      }
      console.log('before DONE')
    }
  );

  add_list_integrity_tests(s);

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

