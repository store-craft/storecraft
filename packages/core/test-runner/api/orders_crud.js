/**
 * @import { OrderDataUpsert } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * 
 */
import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '../../api/index.js';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';


/** @type {OrderDataUpsert[]} */
const items_upsert = [
  {
    contact: {
      email: 'a1@a.com',
    },
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
  },
  {
    contact: {
      email: 'a1@a.com',
    },
    status: {
      checkout: enums.CheckoutStatusEnum.created,
      payment: enums.PaymentOptionsEnum.captured,
      fulfillment: enums.FulfillOptionsEnum.draft
    },
    pricing: {
      quantity_discounted: 3, quantity_total: 5, subtotal: 100, 
      subtotal_discount: 30, subtotal_undiscounted: 70,
      total: 550
    },
    line_items: [
      { id: 'pr-12-id', qty: 3 },
      { id: 'pr-22-id', qty: 2 },
    ],
    shipping_method: {
      handle: 'ship-b', title: 'ship b', price: 60, id: ''
    }
  },  
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {import('uvu').Test<import('./api.utils.crud.js').CrudTestContext<>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.orders,
      events: {
        get_event: 'orders/get',
        upsert_event: 'orders/upsert',
        remove_event: 'orders/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
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