import 'dotenv/config';
import { discounts } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, 
  iso, add_list_integrity_tests,
  get_static_ids,
  image_mock_url_handle_name,
  create_handle} from './api.utils.crud.js';
import { DiscountApplicationEnum, DiscountMetaEnum, 
  FilterMetaEnum } from '@storecraft/core/v-api';
import esMain from './utils.esmain.js';
import { App } from '@storecraft/core';

const url_handle_name = image_mock_url_handle_name(
  'img', file_name(import.meta.url)
);

const handle_gen = create_handle('dis', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** @type {(import('@storecraft/core/v-api').DiscountType & import('@storecraft/core/v-database').idable_concrete)[]} */
const items = get_static_ids('dis').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      id,
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1),
      handle: handle_gen(),
      title: `discount ${ix}`,
      active: true,
      priority: 0,
      application: DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: DiscountMetaEnum.bulk,
          extra: {
            qty: 3, fixed: 100, percent: 100
          }
        },
        filters: [
          {
            meta: FilterMetaEnum.p_all,
          }
        ]
      }
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
    { items: items, app, ops: discounts }
  );

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          await discounts.remove(app, p.handle);
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.db.discounts.upsert(p);
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

