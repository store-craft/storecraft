import { orders } from '@storecraft/core/v-api';
import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws, 
  assert_partial, create_app } from './utils.js';
import { CheckoutStatusEnum, FulfillOptionsEnum, 
  PaymentOptionsEnum } from '@storecraft/core';

const app = await create_app();

/** @type {import('@storecraft/core').OrderDataUpsert[]} */
const items_upsert = [
  {
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
      handle: 'ship-a', name: 'ship a', price: 30
    }
  },
]

test.before(async () => { assert.ok(app.ready) });
const ops = orders;

test('create and get', async () => {
  const one = items_upsert[0];
  const id = await ops.upsert(app, one);
  const item_get = await ops.get(app, id);

  assert_partial(item_get, {...one, id});    
});

test('create and delete', async () => {
  const one = items_upsert[0];
  const id = await ops.upsert(app, one);
  await ops.remove(app, id);
  const item_get = await ops.get(app, id);

  assert.ok(!item_get);

});

test('missing fields should throw', async () => {
  await assert_async_throws(
    async () => await ops.upsert(app, {})
  );
})


test.run();
