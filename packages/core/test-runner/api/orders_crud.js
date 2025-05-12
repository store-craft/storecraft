/**
 * @import { OrderData, OrderDataUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 * @import { events } from '../../pubsub/types.public.js';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '../../api/index.js';
import { assert_partial_v2, file_name } from './api.utils.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { add_sanity_crud_to_test_suite } from './api.crud.js';


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

  /** @type {Test<CrudTestContext<OrderData>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, 
      app, 
      ops: app.api.orders,
      events: {
        get_event: 'orders/get',
        upsert_event: 'orders/upsert',
        remove_event: 'orders/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.isready) 
    }
  );

  add_sanity_crud_to_test_suite(s);

  s('test order events', async (t) => {
    /** @type {Partial<events>} */
    const events = {}

    const unsub = app.pubsub.on(
      '*',
      async (evt) => {
        events[evt.event] = evt.payload;
      }
    );

    /** @type {OrderDataUpsert} */
    const order_upsert_1 = {
      ...items_upsert[0],
      status: {
        checkout: enums.CheckoutStatusEnum.created,
        payment: enums.PaymentOptionsEnum.unpaid,
        fulfillment: enums.FulfillOptionsEnum.draft
      }
    }

    // let's upsert the first order again
    const id = await app.api.orders.upsert(
      order_upsert_1
    );

    { // test required order events
      const events_required = /** @type {const} */(
        [
          'orders/checkout/created',
          'orders/checkout/update',
          'orders/payments/unpaid',
          'orders/payments/update',
          'orders/fulfillment/draft',
          'orders/fulfillment/update',
        ]
      );

      for (const event of events_required) {
        assert.ok(event, `event ${event} not received`);
        assert_partial_v2(
          events[event].current,
          order_upsert_1,
          `event ${event} payload not matching`
        );
        assert.equal(
          events[event].previous,
          undefined,
          `event ${event} previous payload should be undefined`
        );
      }
    }

    const order_get_1 = await app.api.orders.get(id);

    // now change order
    /** @type {OrderDataUpsert} */
    const order_upsert_2 = {
      ...order_get_1,
      status: {
        checkout: enums.CheckoutStatusEnum.complete,
        payment: enums.PaymentOptionsEnum.captured,
        fulfillment: enums.FulfillOptionsEnum.processing
      }
    }
    delete order_upsert_2.updated_at;

    await app.api.orders.upsert(order_upsert_2);

    // console.log(
    //   {
    //     order_get_1
    //   }
    // )

    { // test required order events dispatch after status change
      const events_required = /** @type {const} */(
        [
          'orders/checkout/complete',
          'orders/checkout/update',
          'orders/payments/captured',
          'orders/payments/update',
          'orders/fulfillment/processing',
          'orders/fulfillment/update',
        ]
      );

      for (const event of events_required) {
        // console.log(
        //   {
        //     order_get_1,
        //     ...events[event]
        //   }
        // )
        
        assert.ok(event, `event ${event} not received`);
        assert_partial_v2(
          events[event].current,
          order_upsert_2,
          `event ${event} current payload not matching`
        );
        // test previous payload
        assert_partial_v2(
          events[event].previous,
          order_get_1,
          `event ${event} previous payload not matching`
        );
      }
    }

    await app.api.orders.remove(id);

    unsub();
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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
