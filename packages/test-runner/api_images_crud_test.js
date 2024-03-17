import 'dotenv/config';
import { images } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

/** @type {import('@storecraft/core/v-api').ImageTypeUpsert[]} */
const items_upsert = [
  {
    handle: 'a1-png', name: 'a1.png', url: 'https://host.com/a1.png'
  },
  {
    handle: 'a2-png', name: 'a2.png', url: 'https://host.com/folder/a2.png'
  },
  {
    handle: 'a3-png', name: 'a3.png', url: 'https://host.com/folder/a3.png'
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: images }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await images.remove(app, p.handle);
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
