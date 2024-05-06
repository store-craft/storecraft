import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '@storecraft/core/v-api';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '@storecraft/core';
import { DummyPayments } from '@storecraft/payments-dummy'
import { assert_partial } from './utils.js';
// const app = await create_app();

const handle = create_handle('pr', file_name(import.meta.url));

/** @type {import('@storecraft/core/v-api').ShippingMethodType} */
const shipping = {
  handle: 'ship-checkout-test',
  price: 50,
  title: 'shipping checkout test'
}

/** @type {import('@storecraft/core/v-api').ProductType[]} */
const products = [
  {
    price: 30,
    title: 'product checkout 1',
    handle: 'pr-checkout-1',
    active: true,
    qty: 2
  },
  {
    price: 70,
    title: 'product checkout 2',
    handle: 'pr-checkout-1',
    active: true,
    qty: 2
  }
]

/** @type {import('@storecraft/core/v-api').CheckoutCreateType} */
const items_upsert = {
  contact: {
    email: 'a1@a.com',
  },
  line_items: [
    { id: products[0].handle, qty: 1 },
    { id: products[1].handle, qty: 1 },
  ],
  shipping_method: shipping
}

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const app2 = app.withNewPaymentGateways({
    'dummy' : new DummyPayments({ intent_on_checkout: 'AUTHORIZE' })
  });

  
// const order = await app.api.checkout.create_checkout(
//   {
//     line_items: [
//       {
//         id: 'pr-api-collections-products-test-js-1',
//         qty: 1, 
//         price: 50
//       }
//     ],
//     shipping_method: {
//       title: 'title',
//       handle: 'ship-api-storefronts-all-connections-test-js-2',
//       price: 50
//     },
//     contact: {
//       email: 'a1@a.com'
//     }
//   }, ''
// );

  const s = suite(
    file_name(import.meta.url), 
    { items: items_upsert, app, ops: app.api.orders }
  );

  s.before(
    async () => { 
      assert.ok(app.ready);

      await app2.api.shipping.remove(shipping.handle);
      await app2.api.shipping.upsert(shipping);

      for (const pr of products) {
        await app2.api.products.remove(pr.handle);
        await app2.api.products.upsert(pr);
      }

    }
  );

  s('create checkout', async (ctx) => {
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
      }, 'dummy'
    );

    const one = ctx.items[0];
    const id = await ctx.ops.upsert(one);
  
    assert.ok(id, 'insertion failed');
  
    const item_get = await ctx.ops.get(id);
    assert_partial(item_get, {...one, id});
  });

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
