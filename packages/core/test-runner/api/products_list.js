/**
 * @import { 
 *  CollectionTypeUpsert, ProductType, ProductTypeUpsert 
 * } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  create_handle, file_name, 
  iso, get_static_ids
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_query_list_integrity_tests } from './api.crud.js';

const handle_col = create_handle('col', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion


/** @type {ProductTypeUpsert[]} */
const items = get_static_ids('pr').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      title: `product ${ix}`, 
      price: 50,
      active: true,
      qty: 1,
      handle: handle_pr(),
      id,
      tags: [`tag_${ix}`],
      created_at: iso(jx + 1),
    }
  }
);

/** @type {(CollectionTypeUpsert)[]} */
const collections_upsert = [
  {
    active: true,
    handle: handle_col(),
    id: get_static_ids('col')[0],
    title: 'col 1',
    tags: ['tag-1_a', 'tag-1_b']
  },
  {
    active: true,
    handle: handle_col(),
    id: get_static_ids('col')[1],
    title: 'col 2',
    tags: ['tag-1_a', 'tag-1_b']
  },
]


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<ProductType, ProductTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.products,
      resource: 'products', 
      events: { list_event: 'products/list' }
    }
  );


  s.before(
    async (a) => { 
      assert.ok(app.isready) 
      try {
        for(const p of collections_upsert) {
          await app.api.collections.remove(p.handle);
          await app.api.collections.upsert(p);
        }

        for(const p of items) {
          await app.api.products.remove(p.handle);
          // add collections
          // @ts-ignore
          p.collections = collections_upsert;
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.api.products.upsert(p);
        }
      } catch(e) {
        console.log(e)
        throw e;
      }
    }
  );

  add_query_list_integrity_tests(s, true);

  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();

