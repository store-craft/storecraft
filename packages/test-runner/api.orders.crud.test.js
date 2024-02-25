import 'dotenv/config';
import { orders } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';
import { CheckoutStatusEnum, FulfillOptionsEnum, 
  PaymentOptionsEnum } from '@storecraft/core';
import { add_sanity_crud_to_test_suite, file_name } from './api.utils.crud.js';

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
  {
    status: {
      checkout: CheckoutStatusEnum.created,
      payment: PaymentOptionsEnum.captured,
      fulfillment: FulfillOptionsEnum.draft
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
      handle: 'ship-b', name: 'ship b', price: 60
    }
  },  
]


const s = suite(
  file_name(import.meta.url), 
  { items: items_upsert, app, ops: orders }
);

s.before(
  async () => { 
    assert.ok(app.ready) 
    console.log('before DONE')
  }
);

s.after(async () => { await app.db.disconnect() });

add_sanity_crud_to_test_suite(s).run();
