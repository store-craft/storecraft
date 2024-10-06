import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_list_integrity_tests } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';
import { ID } from '@storecraft/core/api/utils.func.js';

const handle = create_handle('ship', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {(
 *  import('@storecraft/core/api').ShippingMethodType & 
 *  import('@storecraft/core/database').idable_concrete
 * )[]} 
 */
const items = Array.from({length: 10}).map(
  (_, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      title: `shipping ${ix}`, price: 50 + ix,
      handle: handle(),
      id: ID('ship'),
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1)
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {import('uvu').Test<import('./api.utils.crud.js').ListTestContext<>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, app, ops: app.api.shipping_methods,
      resource: 'shipping_methods', events: { list_event: 'shipping/list' }
    }
  );

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          await app.api.shipping_methods.remove(p.handle);
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.db.resources.shipping_methods.upsert(p);
        }
      } catch(e) {
        console.log(e)
        throw e;
      }
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

