import 'dotenv/config';
import { tags } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, assert_query_list} from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';
import { ID } from '@storecraft/core/v-api/utils.func.js';

const handle_tag = create_handle('tag', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** @type {(import('@storecraft/core').TagType & import('../core/types.database.js').idable_concrete)[]} */
const items = Array.from({length: 10}).map(
  (_, ix, arr) => {
    // 5 last items will have the same timestamps
    ix = Math.min(ix, arr.length - 3);
    return {
      handle: handle_tag(),
      values: ['a'],
      id: ID('tag'),
      created_at: iso(ix + 1),
      updated_at: iso(ix + 1)
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items, app, ops: tags }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          await tags.remove(app, p.handle);
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.db.tags.upsert(p);
        }
      } catch(e) {
        console.log(e)
        throw e;
      }
      console.log('before DONE')
    }
  );

  s('query startAt=(updated_at:iso(5)), sortBy=(updated_at), order=asc|desc, limit=3', 
    async () => {
      /** @type {import('@storecraft/core').ApiQuery} */
      const q_asc = {
        startAt: [['updated_at', iso(5)]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 3
      }
      /** @type {import('@storecraft/core').ApiQuery} */
      const q_desc = {
        ...q_asc, order: 'desc'
      }

      const list_asc = await tags.list(app, q_asc);
      const list_desc = await tags.list(app, q_desc);

      assert_query_list(list_asc, q_asc);
      assert_query_list(list_desc, q_desc);
    }
  );

  s('refined query', 
    async () => {
      // last 3 items have the same timestamps, so we refine by ID
      // let's pick one before the last
      const item = items.at(-2);
      /** @type {import('@storecraft/core').ApiQuery} */
      const q = {
        startAt: [['updated_at', item.updated_at], ['id', item.id]],
        sortBy: ['updated_at', 'id'],
        order: 'asc',
        limit: 2
      }

      const list = await tags.list(
        app, q
      );

      // console.log(list)
      // console.log(items)

      assert_query_list(list, q);
      assert.equal(list[0].id, item.id, 'should have had the same id')
    }
  );

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

