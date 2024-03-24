import 'dotenv/config';
import { discounts, products } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '@storecraft/core/v-api';
import { create_handle, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '@storecraft/core';

const handle = create_handle('pr', file_name(import.meta.url));

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );

  /**
   * @typedef {import('@storecraft/core/v-api').DiscountTypeUpsert} DiscountTypeUpsert
   * @typedef {import('@storecraft/core/v-api').RegularDiscountExtra} RegularDiscountExtra
   * @typedef {import('@storecraft/core/v-api').FilterValue_p_in_handles} FilterValue_p_in_handles
   */

  /** @type {import('@storecraft/core/v-api').ProductTypeUpsert[]} */
  const pr_upsert = [
    {
      handle: handle(),
      active: true,
      price: 50,
      qty: 1,
      title: 'product 1',
    },
    {
      handle: handle(),
      active: true,
      price: 50,
      qty: 1,
      title: 'product 2',
      tags: ['red', 'green']
    },
  ]

  /** @type {DiscountTypeUpsert[]} */
  const discounts_upsert = [ // Each discounts_upsert[ix] => applies to pr_upsert[ix] sequence wise
    { // this should give discount for product 1 because of matching handles
      active: true, 
      handle: '10-off-for-product-1', 
      title: '10% OFF for product 1',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.regular,
          /** @type {RegularDiscountExtra} */
          extra: {
            fixed: 0, percent: 10
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.p_in_handles,
            /** @type {FilterValue_p_in_handles} */
            value: [ pr_upsert[0].handle ]
          }
        ]
      }
    },
    { // this should give discount for product 2 because of matching tags
      active: true, 
      handle: '10-off-for-product-2', 
      title: '10% OFF for product 2',
      priority: 0, 
      application: enums.DiscountApplicationEnum.Auto, 
      info: {
        details: {
          meta: enums.DiscountMetaEnum.regular,
          /** @type {RegularDiscountExtra} */
          extra: {
            fixed: 0, percent: 10
          }
        },
        filters: [
          { // discount for a specific product handle
            meta: enums.FilterMetaEnum.p_in_tags,
            /** @type {FilterValue_p_in_handles} */
            value: ['red', 'black']
          }
        ]
      }
    },    
  ]

  s.before(
    async () => { 
      assert.ok(app.ready);

      for(const p of pr_upsert)
        await products.remove(app, p.handle);
      for(const p of discounts_upsert)
        await discounts.remove(app, p.handle);
    }
  );

  s('test discounts->products', async () => {
    // upsert product
    const prs = await Promise.all(
      pr_upsert.map(
        async c => {
          await products.upsert(app, c);
          return products.get(app, c.handle);
        }
      )
    );

    // upsert discount
    const dis = await Promise.all(
      discounts_upsert.map(
        async c => {
          await discounts.upsert(app, c);
          return discounts.get(app, c.handle);
        }
      )
    );

    // console.log(dis)

    // now assert, each product and discount applied
    for(let ix = 0; ix < discounts_upsert.length; ix++) {
      const products_queried = await discounts.list_discounts_products(
        app, discounts_upsert[ix].handle,
        {
          startAt: [['id', prs[ix].id]],
          sortBy: ['id'],
          limit: 1
        }
      );

      assert.ok(products_queried[0].handle===prs[ix].handle);
    }

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
