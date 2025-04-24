/**
 * @import { 
 *  CustomerType, CustomerTypeUpsert, OrderDataUpsert 
 * } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { enums } from '../../api/index.js';

/** @type {CustomerTypeUpsert} */
const customer_upsert ={
  email: 'a1@a.com', 
  firstname: 'name 1', 
  lastname: 'last 1',
}

/** @type {OrderDataUpsert[]} */
const orders_upsert = [
  {
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

  /** @type {Test<CrudTestContext<CustomerType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: orders_upsert, app, ops: app.api.customers,
      events: {
        get_event: 'customers/get',
        upsert_event: 'customers/upsert',
        remove_event: 'customers/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
      } catch(e) {
        console.log(e)
        throw e;
      }
    }
  );

  s('orders->customers query + count', async () => {
    // upsert customer
    await app.api.customers.remove(customer_upsert.email);
    const cus_id = await app.api.customers.upsert(customer_upsert);
    assert.ok(cus_id, 'problem with customer upsert');

    // upsert orders
    for(const p of orders_upsert) {
      const order_id = await app.api.orders.upsert(
        {
          ...p,
          contact: {
            email: customer_upsert.email,
            customer_id: cus_id
          }
        }
      );
      assert.ok(order_id, 'problem with order upsert');
    }

    // get orders of customer
    const orders = await app.api.customers.list_customer_orders(
      cus_id,
    );

    assert.ok(
      orders.length === orders_upsert.length,
      'wrong number of orders'
    );

    assert.ok(
      orders_upsert.every(
        o => orders.find(
          oo => (
            oo.contact.customer_id===cus_id && 
            oo.contact.email===customer_upsert.email
          )
        )!==undefined
      ),
      'wrong number of orders'
    );

    // now test the count
    const count = await app.api.customers.count_customer_orders(
      cus_id,
    );
    assert.ok(
      count === orders_upsert.length,
      'wrong number of orders'
    );

  });

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
