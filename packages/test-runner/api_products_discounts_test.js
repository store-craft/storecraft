import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '@storecraft/core/v-api';
import { 
  create_handle, file_name, promises_sequence 
} from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '@storecraft/core';

const handle_pr = create_handle('pr', file_name(import.meta.url));
const handle_discount = create_handle('10-off', file_name(import.meta.url));

/**
 * @typedef {import('@storecraft/core/v-api').DiscountTypeUpsert} DiscountTypeUpsert
 * @typedef {import('@storecraft/core/v-api').RegularDiscountExtra} RegularDiscountExtra
 * @typedef {import('@storecraft/core/v-api').FilterValue_p_in_handles} FilterValue_p_in_handles
 */

/** @type {import('@storecraft/core/v-api').ProductTypeUpsert[]} */
const pr_upsert = [
  {
    handle: handle_pr(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 11',
  },
  {
    handle: handle_pr(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 21',
  },
]

/** @type {DiscountTypeUpsert[]} */
const discounts_upsert = Array.from({length: 10}).map(
  (_, ix, arr) => (
    {
      active: true, application: enums.DiscountApplicationEnum.Auto, 
      handle: handle_discount(), priority: 0, title: `10% OFF (${ix+1})`,
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
            value: [ pr_upsert[0].handle, pr_upsert[1].handle ]
          }
        ]
      }
    }
  )
)

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );
  
  s.before(
    async () => { 
      assert.ok(app.ready);
      try {
        for(const p of pr_upsert)
          await app.api.products.remove(p.handle);

        for(const d of discounts_upsert)
          await app.api.discounts.remove(d.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );

  s('upsert 1st product -> upsert Discount -> test discount was applied', async () => {
    // upsert 1st product
    await app.api.products.upsert(pr_upsert[0]);

    // upsert all discount
    const ids = await promises_sequence(
      discounts_upsert.map(d => () => app.api.discounts.upsert(d))
    )

    // now query the product's discounts to see if discount was applied to 1st product
    const product_discounts = await app.api.products.list_product_discounts(
      pr_upsert[0].handle
    );

    // console.log(product_discounts.length)

    assert.ok(product_discounts.length>=discounts_upsert.length, 'got less')
  });

  s('upsert 2nd product -> test discount was applied too', async () => {

    // now test upsert 2nd product AFTER discount was created, to test
    // the side-effect, the product should be linked to the discount
    // because it is qualified

    const pr_2 = pr_upsert[1];
    await app.api.products.upsert(pr_2); 

    // now query the product's discounts to see it was applied
    const product_discounts = await app.api.products.list_product_discounts(
      pr_2.handle
    );
    assert.ok(product_discounts.length>=discounts_upsert.length, 'got less')
  });

  s('remove Discount -> test discount was removed from products too', async () => {
    const discount = discounts_upsert[0];
    // remove the discount and then test it does not show in product's discounts
    await app.api.discounts.remove(discount.handle); 

    for(const p of pr_upsert) {
      const product_discounts = await app.api.products.list_product_discounts(
        p.handle
      );
      const no_discount = product_discounts.every(
        d => d.handle!==discount.handle
      );
      assert.ok(no_discount, 'discount was not removed')
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
