import 'dotenv/config';
import { orders } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_list_integrity_tests} from './api.utils.crud.js';
import { App, CheckoutStatusEnum, FulfillOptionsEnum, 
  PaymentOptionsEnum } from '@storecraft/core';
import esMain from './utils.esmain.js';

const order_ids = [
  'order_65e5ca42c43e2c41ae5216a9',
  'order_65e5ca42c43e2c41ae5216aa',
  'order_65e5ca42c43e2c41ae5216ab',
  'order_65e5ca42c43e2c41ae5216ac',
  'order_65e5ca42c43e2c41ae5216ad',
  'order_65e5ca42c43e2c41ae5216ae',
  'order_65e5ca42c43e2c41ae5216af',
  'order_65e5ca42c43e2c41ae5216b0',
  'order_65e5ca42c43e2c41ae5216b1',
  'order_65e5ca42c43e2c41ae5216b2'
];

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** @type {(import('@storecraft/core').OrderData & import('../core/types.database.js').idable_concrete)[]} */
const items = order_ids.map(
  (id, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      id: id,
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1),
      status: {
        checkout: CheckoutStatusEnum.created,
        payment: PaymentOptionsEnum.authorized,
        fulfillment: FulfillOptionsEnum.draft
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
        handle: 'ship-a', title: 'ship a', price: 30
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
    { items: items, app, ops: orders }
  );

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          await orders.remove(app, p.id);
          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
            await app.db.orders.upsert(p);
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

// console.log(
//   Array.from({length: 10}).map(
//     ix => ID('order')
//   )
// )