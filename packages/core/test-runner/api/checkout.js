/**
 * @import { 
 *  ShippingMethodTypeUpsert, ProductTypeUpsert 
 * } from '../../api/types.api.js'
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '../../api/index.js';
import { file_name } from './api.utils.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { DummyPayments } from '../../payments/dummy/index.js'
import { assert_async_throws } from './api.utils.js';
import { UniformTaxes } from '../../tax/public.js';


/** @type {ShippingMethodTypeUpsert} */
const shipping = {
  handle: 'ship-checkout-test',
  price: 50,
  title: 'shipping checkout test',
}

/** @type {ProductTypeUpsert[]} */
const products = [
  {
    price: 30,
    title: 'product checkout 1',
    handle: 'pr-checkout-1',
    active: true,
    qty: 10
  },
  {
    price: 70,
    title: 'product checkout 2',
    handle: 'pr-checkout-2',
    active: true,
    qty: 10
  }
]


/**
 * @param {App} app 
 */
export const create = (app) => {

  const create_aug_app = () => {
    return app.withPaymentGateways(
      {
        ...(app._.gateways ?? {}),
        'dummy_payments' : new DummyPayments({ intent_on_checkout: 'AUTHORIZE' })
      }
    ).withTaxes(new UniformTaxes(10))
    .init();
  }

  /** @type {ReturnType<typeof create_aug_app>} */
  let app2;

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  s.before(
    async () => { 
      assert.ok(app.isready);
      app2 = create_aug_app();
      
      await app2.api.shipping_methods.remove(shipping.handle);
      await app2.api.shipping_methods.upsert(shipping);

      for (const pr of products) {
        await app2.api.products.remove(pr.handle);
        await app2.api.products.upsert(pr);
      }

    }
  );

  s('create -> complete checkout should succeed', async (ctx) => {
    
    let is_event_checkout_create_ok = false;
    const unsub_checkout_create = app2.pubsub.on(
      'orders/checkout/created',
      async (v) => {
        is_event_checkout_create_ok = Boolean(v.payload.current.id);
      }
    );

    const draft_order = await app2.api.checkout.create_checkout(
      {
        line_items: [
          { id: products[0].handle, qty: 1 },
          { id: products[1].handle, qty: 1 },
        ],
        shipping_method: shipping,
        contact: {
          email: 'a1@a.com'
        }
      }, 'dummy_payments'
    );

    { // test the create part

      // console.log(draft_order)
      assert.ok(
        draft_order?.id,
        `draft has no id`
      );

      assert.not(
        draft_order?.validation?.length>0,
        `validation errors were found`
      );

      // status

      assert.ok(
        draft_order.status.checkout.id===enums.CheckoutStatusEnum.created.id,
        `status error`
      );

      // pricing
      assert.ok(
        draft_order?.pricing?.total,
        'pricing was not set'
      );

      // payment
      assert.ok(
        draft_order?.pricing?.taxes.length &&
        draft_order?.pricing?.total!=draft_order?.pricing?.total_without_taxes,
        'taxes was not set'
      );

      assert.ok(
        (
          (draft_order?.payment_gateway.gateway_handle==='dummy_payments') &&
          (draft_order?.payment_gateway.latest_status) &&
          (draft_order?.payment_gateway.on_checkout_create)
        ),
        'payment gateway was not set'
      );

      assert.ok(is_event_checkout_create_ok, 'checkout create event error');

      unsub_checkout_create();
    }


    { // test the complete checkout part
      let is_event_checkout_complete_ok = false;
      const unsub_checkout_complete = app.pubsub.on(
        'orders/checkout/complete',
        (v) => {
          is_event_checkout_complete_ok = Boolean(v.payload.current.id);
        }
      );
  
      const order = await app2.api.checkout.complete_checkout(
        draft_order.id
      );
  
      // general
  
      assert.ok(
        order?.id,
        `order has no id`
      );
  
      // status
  
      assert.ok(
        order.status.checkout.id==enums.CheckoutStatusEnum.complete.id,
        `checkout status error`
      );
  
      const authorize_on_checkout = app2.__show_me_everything.gateways.dummy_payments.config.intent_on_checkout==='AUTHORIZE';
      const expected_payment_status = (
        authorize_on_checkout ? enums.PaymentOptionsEnum.authorized.id : 
                  enums.PaymentOptionsEnum.captured.id
      );
  
      assert.ok(
        order?.payment_gateway.on_checkout_complete,
        'payment_gateway.on_checkout_complete was not set'
      );

      assert.ok(
        order.status.payment.id===expected_payment_status,
        `payment status error`
      );

      assert.ok(is_event_checkout_complete_ok, 'checkout complete event error');

      unsub_checkout_complete();
    }

  });



  s('create checkout with automatic stock', async (ctx) => {
    const previous_checkout_reserve_stock_on = app2.config.checkout_reserve_stock_on;

    app2.config.checkout_reserve_stock_on = 'checkout_create';
    
    try {
      const get_products_1 = await Promise.all(
        products.map(pr => app2.api.products.get(pr.handle))
      )

      const draft_order = await app2.api.checkout.create_checkout(
        {
          line_items: products.map(
            pr => (
              {
                id: pr.handle,
                qty: 2
              }
            )
          ),
          shipping_method: shipping,
          contact: {
            email: 'a1@a.com'
          }
        }, 'dummy_payments'
      );
  
      { // let's test quantities reduced by 2
        const expected_quantities = get_products_1.map(
          (pr, ix) => pr.qty - draft_order.line_items[ix].qty
        );
  
        const actual_quantities = await Promise.all(
          draft_order.line_items.map(
            li => app2.api.products.get(li.id).then(pr => pr.qty)
          )
        );
  
        assert.equal(
          actual_quantities, expected_quantities,
          `Stock Quantities did not reduce well`
        );
      }

      { // assert `stock_reserved was et as well`
        assert.ok(
          draft_order.line_items.every(
            li => li.qty==li.stock_reserved
          ),
          `stock_reserved was not set properly to match the quantities`
        )
      }

    } catch (e) {
      throw e;
    } finally {
      app2.config.checkout_reserve_stock_on = previous_checkout_reserve_stock_on;
    }

  });


  s('create and complete checkout with automatic stock', async (ctx) => {
    const previous_checkout_reserve_stock_on = app2.config.checkout_reserve_stock_on;

    app2.config.checkout_reserve_stock_on = 'checkout_complete';

    
    try {
      const get_products_1 = await Promise.all(
        products.map(pr => app2.api.products.get(pr.handle))
      )

      const draft_order = await app2.api.checkout.create_checkout(
        {
          line_items: products.map(
            pr => (
              {
                id: pr.handle,
                qty: 2
              }
            )
          ),
          shipping_method: shipping,
          contact: {
            email: 'a1@a.com'
          }
        }, 'dummy_payments'
      );
  
      const order_complete = await app2.api.checkout.complete_checkout(draft_order.id);

      { // let's test quantities reduced by 2
        const expected_quantities = get_products_1.map(
          (pr, ix) => pr.qty - draft_order.line_items[ix].qty
        );
  
        const actual_quantities = await Promise.all(
          draft_order.line_items.map(
            li => app2.api.products.get(li.id).then(pr => pr.qty)
          )
        );
  
        assert.equal(
          actual_quantities, expected_quantities,
          `Stock Quantities did not reduce well`
        );
      }

      { // assert `stock_reserved was et as well`
        assert.ok(
          order_complete.line_items.every(
            li => li.qty==li.stock_reserved
          ),
          `stock_reserved was not set properly to match the quantities`
        )
      }

    } catch (e) {
      throw e;
    } finally {
      app2.config.checkout_reserve_stock_on = previous_checkout_reserve_stock_on;
    }

  });


  s('create checkout should fail validation when line item is missing', async (ctx) => {
    const order = await app2.api.checkout.create_checkout(
      {
        line_items: [
          { id: 'do-not-exist', qty: 1 },
          { id: products[1].handle, qty: 1 },
        ],
        shipping_method: shipping,
        contact: {
          email: 'a1@a.com'
        }
      }, 'dummy_payments'
    );

    // general

    assert.ok(
      order?.validation?.length>0,
      `validation errors should have been found`
    );

  });


  s('create checkout should fail validation when shipping method is missing', async (ctx) => {
    const order = await app2.api.checkout.create_checkout(
      {
        line_items: [
          { id: products[1].handle, qty: 1 },
        ],
        shipping_method: {
          handle: 'shipping does not exist',
          id: 'shipping does not exist'
        },
        contact: {
          email: 'a1@a.com'
        }
      }, 'dummy_payments'
    );

    // general

    assert.ok(
      order?.validation?.length>0,
      `validation errors were found`
    );

    // console.log(order.validation)

  });


  s('create checkout should fail validation when missing quantities', async (ctx) => {
    const order = await app2.api.checkout.create_checkout(
      {
        line_items: [
          { id: products[1].handle, qty: 100 },
        ],
        shipping_method: shipping,
        contact: {
          email: 'a1@a.com'
        }
      }, 'dummy_payments'
    );

    // general

    assert.ok(
      order?.validation?.length>0,
      `validation errors were found`
    );

    // console.log(order.validation)

  });

  s('create checkout should throw when gateway is missing', async (ctx) => {
    await assert_async_throws(
      () => {
        return app2.api.checkout.create_checkout(
          {
            line_items: [
              { id: products[1].handle, qty: 1 },
            ],
            shipping_method: shipping,
            contact: {
              email: 'a1@a.com'
            }
          // @ts-ignore
          }, 'i do not exist'
        );
      }
    )

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
