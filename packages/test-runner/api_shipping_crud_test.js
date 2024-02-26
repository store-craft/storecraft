import 'dotenv/config';
import { shipping } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

// const app = await create_app();

/** @type {import('@storecraft/core').ShippingMethodTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'ship-1', name: 'ship 1', price: 50
  },
  {
    handle: 'ship-2', name: 'ship 2', price: 50
  },
  {
    handle: 'ship-3', name: 'ship 3', price: 50
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: shipping }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await shipping.remove(app, p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

      console.log('before DONE')
    }
  );

  s.after(async () => { await app.db.disconnect() });
  add_sanity_crud_to_test_suite(s);
  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('./play.js');
    const app = await create_app();
    create(app).run();
  } catch (e) {
  }
})();
