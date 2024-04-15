import 'dotenv/config';
import { storefronts } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

const handle_sf = create_handle('sf', file_name(import.meta.url));

/** @type {import('@storecraft/core/v-api').StorefrontTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle_sf(), title: 'sf 1', active: true
  },
  {
    handle: handle_sf(), title: 'sf 2', active: true
  },
  {
    handle: handle_sf(), title: 'sf 3', active: true
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: storefronts }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await storefronts.remove(app, p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

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
