import 'dotenv/config';
import { customers } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, add_sanity_crud_to_test_suite, 
  create_handle } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

/** @type {import('@storecraft/core/v-api').CustomerTypeUpsert[]} */
const items_upsert = [
  {
    email: 'a1@a.com', firstname: 'name 1', lastname: 'last 1',
  },
  {
    email: 'a2@a.com', firstname: 'name 2', lastname: 'last 2',
  },
  {
    email: 'a3@a.com', firstname: 'name 3', lastname: 'last 3',
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: customers }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert) {
          const get = await customers.getByEmail(app, p.email);
          if(get)
            await customers.remove(app, get.id);
        }
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
