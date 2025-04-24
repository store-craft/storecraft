/**
 * @import { OrderData, OrderDataUpsert } from '../../api/types.api.js'
 * @import { QueryTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  file_name, iso, get_static_ids
} from './api.utils.js';
import { enums } from '../../api/index.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { add_query_list_integrity_tests } from './api.crud.js';

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {OrderDataUpsert[]} 
 */
const items = get_static_ids('order').map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      id: id,
      created_at: iso(jx + 1),
      status: {
        checkout: enums.CheckoutStatusEnum.created,
        payment: enums.PaymentOptionsEnum.authorized,
        fulfillment: enums.FulfillOptionsEnum.draft
      },
      pricing: {
        
        quantity_discounted: 3, quantity_total: 5, subtotal: 100, 
        subtotal_discount: 30, subtotal_undiscounted: 70,
        total: 120
      },
      line_items: [
        { id: 'pr-1-id', qty: 3 },
        { id: 'pr-2-id', qty: 2 },
      ],
      shipping_method: {
        handle: 'ship-a', title: 'ship a', price: 30, id: ''
      }
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<QueryTestContext<OrderData, OrderDataUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, 
      app, 
      ops: app.api.orders,
      resource: 'orders', 
      events: { list_event: 'orders/list' }
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
