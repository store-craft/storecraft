/**
 * @import { 
 *  PaymentGatewayItemGet, OrderDataUpsert 
 * } from '../../api/types.api.js';
 * @import { Config } from '../../payments/dummy/types.public.js';
 * @import { payment_gateway } from '../../payments/types.payments.js';
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { 
  App, CheckoutStatusEnum, FulfillOptionsEnum, 
  PaymentOptionsEnum } from '../../index.js';
import { DummyPayments } from '../../payments/dummy/index.js'
import { assert_async_throws, withRandom } from './utils.js';
import { ID } from '../../api/utils.func.js';

/**
 * @param {App} app 
 */
export const create = (app) => {
  const test_order_id = ID('order');
  const payment_gateway_transaction_id = withRandom('pay');

  /** @satisfies {Config["seed"]} */
  const seed = /** @type {const} */({
    [payment_gateway_transaction_id]: {
      created_at: new Date().toISOString(),
      id: payment_gateway_transaction_id,
      status: 'created',
      currency: 'USD',
      price: 100,
      metadata: {
        external_order_id: test_order_id
      }
    }
  })

  const dummy_1 = new DummyPayments({seed});
  const dummy_2 = new DummyPayments();

  /** @type {OrderDataUpsert} */
  const test_order = {
    id: test_order_id,
    line_items: [],
    pricing: {
      quantity_discounted: 0,
      quantity_total: 0,
      total: 0,
      subtotal: 0,
      subtotal_discount: 0,
      subtotal_undiscounted: 0
    },
    shipping_method: {
      handle: 'test',
      id: 'test',
      price: 0,
      title: 'test',
    },
    status: {
      checkout: CheckoutStatusEnum.unknown,
      payment: PaymentOptionsEnum.unpaid,
      fulfillment: FulfillOptionsEnum.draft
    },
    payment_gateway: {
      gateway_handle: 'dummy_1',
      // this is the dummy payments mocked up checkout create
      // result, which it uses to identify orders in the gateway.
      on_checkout_create: payment_gateway_transaction_id,
    }
  }

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  const create_aug_app = () => {
    return app.withPaymentGateways(
      {
        ...(app.gateways ?? {}),
        dummy_1,
        dummy_2,
      }
    );
  }

  /** @type {ReturnType<typeof create_aug_app>} */
  let app2;

  s.before(
    async () => { 
      assert.ok(app.ready);
      // we setup here to avoid race condition with other
      // tests that might hijack and change the app.
      // here this is safe because they will run in a queue.
      app2 = create_aug_app();
      await app2.api.orders.upsert(test_order);
    }
  );

  s.after(
    async () => { 
      assert.ok(app.ready);
      await app2.api.orders.remove(test_order.id);
    }
  );

  /**
   * 
   * @param {PaymentGatewayItemGet} pg_item_get 
   * @param {string} real_gw_handle 
   * @param {payment_gateway} real_gw 
   */
  const test_gw_integrity = (pg_item_get, real_gw_handle, real_gw) => {
    assert.equal(pg_item_get.config, real_gw.config, 'config is not same');
    assert.equal(pg_item_get.actions, real_gw.actions, 'actions is not same');
    assert.equal(pg_item_get.handle, real_gw_handle, 'handle is not same');
    assert.equal(pg_item_get.info, real_gw.info, 'info is not same');
  }

  s('get', async (ctx) => {
    const gw_item_get = await app2.api.payments.get('dummy_1');
    test_gw_integrity(gw_item_get, 'dummy_1', dummy_1);
  });

  s('list_all', async (ctx) => {
    const list_gw_items = await app.api.payments.list_all();
    const gw_item_dummy_1 = list_gw_items.find(
      (item) => item.handle === 'dummy_1'
    );
    const gw_item_dummy_2 = list_gw_items.find(
      (item) => item.handle === 'dummy_2'
    );

    test_gw_integrity(gw_item_dummy_1, 'dummy_1', dummy_1);
    test_gw_integrity(gw_item_dummy_2, 'dummy_2', dummy_2);
  });

  s('invoke_action with legit order', async (ctx) => {
    const status = await app2.api.payments.invoke_action(
      test_order.id,
      'ping'
    );

    assert.equal(
      status.messages[0], 
      test_order.payment_gateway.on_checkout_create, 
      'ping action did not return the same gateway checkout create result'
    );

    { // test with non legit order
      await assert_async_throws(
        async () => {
          await app2.api.payments.invoke_action(
            'i-dont-exist',
            'ping'
          );
        },
        'invoke action with non order should throw error'
      )
    }
  });


  
  s('status_of_order', async (ctx) => {
    const status = await app2.api.payments.status_of_order(
      test_order.id,
    );

    assert.ok(
      status && status.messages && status.messages.length,
      'status_of_order should return status messages'
    );

    assert.ok(
      status && status.actions,
      'status_of_order should return actions'
    );

    { // test with non legit order
      await assert_async_throws(
        async () => {
          await app2.api.payments.status_of_order(
            'i-dont-exist',
          );
        },
        'Should throw when given non order'
      )
    }
    // console.log({status})
  });  


  s('buy_ui', async (ctx) => {
    const html = await app2.api.payments.buy_ui(
      test_order.id,
    );

    assert.ok(
      html,
      'html did not return'
    );

    { // test with non legit order
      await assert_async_throws(
        async () => {
          await app2.api.payments.status_of_order(
            'i-dont-exist',
          );
        },
        'Should throw when given non order'
      )
    }

  });  


  s('webhook', async (ctx) => {
    await app2.api.payments.webhook(
      'dummy_1',
      new Request('https://example.com', 
        {
          method: 'POST',
          body: JSON.stringify({
            // internal payment gateway identifier, which is used
            // in his own system to identify the transaction
            id: test_order.payment_gateway.on_checkout_create
          }),
          headers: {
            'content-type': 'application/json'
          }
        }
      )
    );

    
    { // test order status has been updated due to webhook
      const order = await app2.api.orders.get(test_order.id);
      assert.equal(
        order.status.payment, 
        PaymentOptionsEnum.captured,
        'payment status was not updated'
      );
      assert.equal(
        order.status.checkout, 
        CheckoutStatusEnum.complete,
        'checkout status was not updated'
      );
    }

    { // test with non legit order
      await assert_async_throws(
        async () => {
          await app2.api.payments.webhook(
            'dummy_1',
            new Request('https://example.com', 
              {
                method: 'POST',
                body: JSON.stringify({
                  id: 'i-dont-exist'
                }),
                headers: {
                  'content-type': 'application/json'
                }
              }
            )
          );
        },
        'Should throw when given non order'
      )
    }

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
