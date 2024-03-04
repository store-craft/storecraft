import 'dotenv/config';
import { storefronts } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_list_integrity_tests,
  get_static_ids} from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

const handle = create_handle('ship', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** @type {(import('@storecraft/core').StorefrontType & import('../core/types.database.js').idable_concrete)[]} */
const items = get_static_ids('sf').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      title: `sf ${ix}`,
      handle: handle(),
      id,
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1),
      active: true,
      tags: [`tag-sf_${ix}`]
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
    { items: items, app, ops: storefronts }
  );

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          await storefronts.remove(app, p.id);
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
            await app.db.storefronts.upsert(p);
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

