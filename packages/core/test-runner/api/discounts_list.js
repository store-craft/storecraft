/**
 * @import { DiscountType, DiscountTypeUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, 
  iso, add_query_list_integrity_tests,
  get_static_ids,
  create_handle} from './api.utils.crud.js';
import { enums } from '../../api/index.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';

const handle_gen = create_handle('dis', file_name(import.meta.url));

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {DiscountTypeUpsert[]} 
 */
const items = get_static_ids('dis').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      id,
      created_at: iso(jx + 1),
      handle: handle_gen(),
      title: `discount ${ix}`,
      active: true,
      priority: 0,
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          type: 'bulk',
          // meta: enums.DiscountMetaEnum.bulk,
          extra: {
            qty: 3, fixed: 100, percent: 100
          }
        },
        filters: [
          {
            op: 'p-all',
            meta: enums.FilterMetaEnum.p_all,
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

  /** @type {Test<QueryTestContext<DiscountType, DiscountTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.discounts,
      resource: 'discounts', 
      events: { list_event: 'discounts/list' }
    }
  );
  
  add_query_list_integrity_tests(s);

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

