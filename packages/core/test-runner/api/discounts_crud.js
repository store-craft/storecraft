/**
 * @import { DiscountType, DiscountTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '../../api/index.js';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';


/** @type {DiscountTypeUpsert[]} */
const items_upsert = [
  {
    active: true, 
    handle: '3-for-100', priority: 0, title: 'Buy 3 for 100',
    application: enums.DiscountApplicationEnum.Auto, 
    info: {
      details: {
        meta: enums.DiscountMetaEnum.bulk,
        extra: {
          qty: 3, fixed: 100, percent: 100
        }
      },
      filters: [
        {
          meta: enums.FilterMetaEnum.p_all,
        }
      ]
    }
  },
  {
    active: false, 
    handle: '2-for-60', priority: 0, title: 'Buy 2 for 60',
    application: enums.DiscountApplicationEnum.Auto, 
    info: {
      details: {
        meta: enums.DiscountMetaEnum.bulk,
        extra: {
          qty: 3, fixed: 100, percent: 100
        }
      },
      filters: [
        {
          meta: enums.FilterMetaEnum.p_all,
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

  /** @type {Test<CrudTestContext<DiscountType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.discounts,
      events: {
        get_event: 'discounts/get',
        upsert_event: 'discounts/upsert',
        remove_event: 'discounts/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert) {
          const get = await app.api.discounts.remove(p.handle);
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
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
