import 'dotenv/config';
import { discounts } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App, DiscountApplicationEnum, 
  DiscountMetaEnum, FilterMetaEnum } from '@storecraft/core';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';

// const app = await create_app();

/** @type {import('@storecraft/core').DiscountTypeUpsert[]} */
const items_upsert = [
  {
    active: true, 
    handle: '3-for-100', priority: 0, title: 'Buy 3 for 100',
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
  },
  {
    active: false, 
    handle: '2-for-60', priority: 0, title: 'Buy 2 for 60',
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
  },  
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: discounts }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert) {
          const get = await discounts.remove(app, p.handle);
        }
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
