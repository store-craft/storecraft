import 'dotenv/config';
import { products } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, create_handle, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

const handle = create_handle('pr', file_name(import.meta.url));

/** @type {import('@storecraft/core').ProductTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1'
  },
  {
    handle: handle(),
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
  },
  {
    handle: handle(),
    active: true,
    price: 250,
    qty: 3,
    title: 'product 3',
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: products }
  );
  
  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await products.remove(app, p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

      console.log('before DONE')
    }
  );

  add_sanity_crud_to_test_suite(s);
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
