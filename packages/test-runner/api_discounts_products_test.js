import 'dotenv/config';
import { discounts, products } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App, DiscountApplicationEnum, 
  DiscountMetaEnum, FilterMetaEnum } from '@storecraft/core';
import { create_handle, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';

// const app = await create_app();
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
   * @typedef {import('@storecraft/core').DiscountTypeUpsert} DiscountTypeUpsert
   * @typedef {import('@storecraft/core').RegularDiscountExtra} RegularDiscountExtra
   * @typedef {import('@storecraft/core').FilterValue_p_in_handles} FilterValue_p_in_handles
   */

  /** @type {import('@storecraft/core').ProductTypeUpsert[]} */
  const pr_upsert = [
    {
      handle: handle(),
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
