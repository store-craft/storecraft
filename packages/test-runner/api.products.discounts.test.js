import 'dotenv/config';
import { discounts, products } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';
import { DiscountApplicationEnum, 
  DiscountMetaEnum, FilterMetaEnum } from '@storecraft/core';
import { file_name } from './api.utils.crud.js';

const app = await create_app();
const s = suite(
  file_name(import.meta.url), 
);

/**
 * @typedef {import('@storecraft/core').DiscountTypeUpsert} DiscountTypeUpsert
 * @typedef {import('@storecraft/core').RegularDiscountExtra} RegularDiscountExtra
 * @typedef {import('@storecraft/core').FilterValue_p_in_handles} FilterValue_p_in_handles
 */

/** @type {import('@storecraft/core').ProductTypeUpsert[]} */
const pr_upsert = [
  {
    handle: 'pr-11',
    active: true,
    price: 50,
    qty: 1,
    title: 'product 11',
  },
  {
    handle: 'pr-21',
    active: true,
    price: 50,
    qty: 1,
    title: 'product 21',
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
          value: [ pr_upsert[0].handle, pr_upsert[1].handle ]
        }
      ]
    }
  },
]

s.before(
  async () => { 
    assert.ok(app.ready);
    try {
      for(const p of pr_upsert)
        await products.remove(app, p.handle);

      for(const d of discounts_upsert)
        await discounts.remove(app, d.handle);
    } catch(e) {
      console.log(e)
      throw e;
    }

    console.log('before DONE')
  }
);

s.after(async () => { await app.db.disconnect(); });

s('upsert 1st product -> upsert Discount -> test discount was applied', async () => {
  // upsert 1st product
  await products.upsert(app, pr_upsert[0]);

  // upsert discount
  await discounts.upsert(app, discounts_upsert[0]);

  // now query the product's discounts to see if discount was applied to 1st product
  const product_discounts = await products.list_product_discounts(
    app, pr_upsert[0].handle
  );
  // console.log(product_discounts)

  const find_discount = product_discounts.find(
    d => d.handle===discounts_upsert[0].handle
  )
  assert.ok(find_discount, 'discount was not applied')
});

s('upsert 2nd product -> test discount was applied too', async () => {

  // now test upsert 2nd product AFTER discount was created, to test
  // the side-effect, the product should be linked to the discount
  // because it is qualified

  const pr_2 = pr_upsert[1];
  await products.upsert(app, pr_2); 

  // now query the product's discounts to see it was applied
  const product_discounts = await products.list_product_discounts(
    app, pr_2.handle
  );
  // console.log(product_discounts)

  const find_discount = product_discounts.find(
    d => d.handle===discounts_upsert[0].handle
  )
  assert.ok(find_discount, 'discount was not applied')
  
});

s('remove Discount -> test discount was removed from products too', async () => {
  const discount = discounts_upsert[0];
  // remove the discount and then test it does not show in product's discounts
  await discounts.remove(app, discount.handle); 

  for(const p of pr_upsert) {
    const product_discounts = await products.list_product_discounts(
      app, p.handle
    );
    const no_discount = product_discounts.every(
      d => d.handle!==discount.handle
    );
    assert.ok(no_discount, 'discount was not removed')
  }
  
});

s.run();
