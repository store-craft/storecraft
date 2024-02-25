import { discounts, products } from '@storecraft/core/v-api';
import 'dotenv/config';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';
import { DiscountApplicationEnum, DiscountMetaEnum, FilterMetaEnum } from '@storecraft/core';

const app = await create_app();

/**
 * @typedef {import('@storecraft/core').DiscountTypeUpsert} DiscountTypeUpsert
 * @typedef {import('@storecraft/core').RegularDiscountExtra} RegularDiscountExtra
 * @typedef {import('@storecraft/core').FilterValue_p_in_handles} FilterValue_p_in_handles
 */

/** @type {import('@storecraft/core').ProductTypeUpsert[]} */
const pr_upsert = [
  {
    handle: 'pr-1',
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1',
  },
]

/** @type {DiscountTypeUpsert[]} */
const discounts_upsert = [
  {
    active: true, application: DiscountApplicationEnum.Auto, 
    handle: '10-off', priority: 0, title: '10% OFF',
    info: {
      details: {
        meta: DiscountMetaEnum.regular,
        /** @type {RegularDiscountExtra} */
        extra: {
          fixed: 0, percent: 10
        }
      },
      filters: [
        { // discount for a specific product handle
          meta: FilterMetaEnum.p_in_handles,
          /** @type {FilterValue_p_in_handles} */
          value: [ pr_upsert[0].handle ]
        }
      ]
    }
  },
]

test.before(async () => { assert.ok(app.ready) });
test.after(async () => { await app.db.disconnect() });

test('create', async () => {
  // upsert product
  const prs = await Promise.all(
    pr_upsert.map(
      async c => {
        try { await products.upsert(app, c); } catch (e) {};
        return products.get(app, c.handle);
      }
    )
  );

  // upsert discount
  const dis = await Promise.all(
    discounts_upsert.map(
      async c => {
        try { await discounts.upsert(app, c); } catch (e) { console.log(e)};
        return discounts.get(app, c.handle);
      }
    )
  );

  // console.log(dis)

  // now query list of products of discount
  const products_queried = await discounts.list_discounts_products(
    app, discounts_upsert[0].handle,
    {
      startAt: [['id', prs[0].id]],
      sortBy: ['id'],
      limit: 1
    }
  );

  // console.log(products_queried)
  // the first returned product should be the product
  assert.ok(products_queried[0].handle===pr_upsert[0].handle);

});

test.run();
