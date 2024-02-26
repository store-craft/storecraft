import 'dotenv/config';
import { tags } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws } from './utils.js';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name, 
  iso} from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';
import { ID } from '@storecraft/core/v-api/utils.func.js';

const handle_tag = create_handle('tag', file_name(import.meta.url));

/**
 * 
 * @param {any[]} vec1 
 * @param {any[]} vec2 
 */
const compare_tuples = (vec1, vec2) => {
  for(let ix = 0; ix < vec1.length; ix++) {
    const v1 = vec1[ix], v2 = vec2[ix];
    if(v1===v2) continue;
    if(v1>v2) return 1;
    if(v1<v2) return -1;
  }
  return 0;
}

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** @type {(import('@storecraft/core').TagType & import('../core/types.database.js').idable_concrete)[]} */
const items = Array.from({length: 10}).map(
  (_, ix) => {
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

  s('query startAt=(updated_at:iso(5)), sortBy=(updated_at), order=asc, limit=3', async () => {
    /** @type {import('@storecraft/core').ApiQuery} */
    const q = {
      startAt: [['updated_at', iso(5)]],
      sortBy: ['updated_at'],
      order: 'asc',
      limit: 3
    }
    const list = await tags.list(
      app, q
    );
    // assert limit
    assert.equal(list.length, q.limit, `limit != ${list.length}`)
    // assert order
    if(q.sortBy) {
      const order_preserved = list.slice(1).every(
        (it, ix) => {
          const prev = from.map(c => list[ix][c[0]]);
          const current = from.map(c => it[c[0]]);
          const sign = compare_tuples(current, prev);
          const asc = q.order==='asc';
          assert.ok(asc ? sign>=0 : sign<=0, `list item #${ix-1} does not preserve order !`)
        }
      );
    }


    // assert startAt/endAt integrity
    const from = q.startAfter ?? q.startAt;
    const to = q.endBefore ?? q.endAt;
    if(from || to) {
      for(let ix=0; ix < list.length; ix++) {
        const it = list[ix];

        if(from) {
          const v1 = from.map(c => c[1]);
          const v2 = from.map(c => it[c[0]]);
          const sign = compare_tuples(v2, v1);
          assert.ok(
            q.startAt ? sign>=0 : sign > 0, 
            `list item #${ix} does not obey ${from} !`)
        }

        if(to) {
          const v1 = to.map(c => c[1]);
          const v2 = to.map(c => it[c[0]]);
          const sign = compare_tuples(v2, v1);
          assert.ok(
            q.endAt ? sign<=0 : sign < 0, 
            `list item #${ix} does not obey ${to} !`)
        }
      }
    }
    assert.ok(list[0].updated_at===iso(5), 'got start at item incorrect !')
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
