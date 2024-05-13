import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '@storecraft/core';
import { 
  setup_for_discount_filter_product_all, 
  setup_for_discount_filter_product_in_collections, 
  setup_for_discount_filter_product_in_handles, 
  setup_for_discount_filter_product_in_tags, 
  setup_for_discount_filter_product_NOT_in_collections, 
  setup_for_discount_filter_product_NOT_in_handles, 
  setup_for_discount_filter_product_NOT_in_tags 
} from './api_fixtures_discounts_products_test.js';

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



  s.before(
    async () => { 
      assert.ok(app.ready);
    }
  );

  s('test product has handles', async () => {

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_in_handles()

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100
      }
    );

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    assert.ok(
      products_positive.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

    assert.ok(
      products_negative.every(
        p => !Boolean(products_queried.find(pq => pq.handle===p.handle))
      ),
      'discount was applied to some negative discounts'
    );

  });


  s('test product has NO handles', async () => {

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_NOT_in_handles()

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100
      }
    );

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    assert.ok(
      products_positive.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

    assert.ok(
      products_negative.every(
        p => !Boolean(products_queried.find(pq => pq.handle===p.handle))
      ),
      'discount was applied to some negative discounts'
    );

  });


  s('test product has tags', async () => {

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_in_tags()

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100
      }
    );

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    assert.ok(
      products_positive.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

    assert.ok(
      products_negative.every(
        p => !Boolean(products_queried.find(pq => pq.handle===p.handle))
      ),
      'discount was applied to some negative discounts'
    );

  });


  s('test product NOT has tags', async () => {

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_NOT_in_tags()

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100

      }
    );

    // console.log('products_positive', products_positive)
    // console.log('products_queried', products_queried)

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    assert.ok(
      products_positive.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

    assert.ok(
      products_negative.every(
        p => !Boolean(products_queried.find(pq => pq.handle===p.handle))
      ),
      'discount was applied to some negative discounts'
    );

  });


  s('test product in collections', async () => {

    const {
      discount, products_negative, products_positive,
      collections
    } = setup_for_discount_filter_product_in_collections()

    // remove all 
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    for(const c of collections)
      await app.api.collections.remove(c.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert collections
    for(const c of collections)
      await app.api.collections.upsert(c);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100
      }
    );

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    assert.ok(
      products_positive.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

    assert.ok(
      products_negative.every(
        p => !Boolean(products_queried.find(pq => pq.handle===p.handle))
      ),
      'discount was applied to some negative discounts'
    );

  });


  s('test product NOT in collections', async () => {

    const {
      discount, products_negative, products_positive,
      collections
    } = setup_for_discount_filter_product_NOT_in_collections()

    // remove all 
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    for(const c of collections)
      await app.api.collections.remove(c.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert collections
    for(const c of collections)
      await app.api.collections.upsert(c);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100
      }
    );

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    assert.ok(
      products_positive.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

    assert.ok(
      products_negative.every(
        p => !Boolean(products_queried.find(pq => pq.handle===p.handle))
      ),
      'discount was applied to some negative discounts'
    );

  });


  s('test product ALL', async () => {

    const {
      discount, products
    } = setup_for_discount_filter_product_all()

    // remove all 
    for(const p of products)
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of products)
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const now = (new Date()).toISOString();

    const products_queried = await app.api.discounts.list_discounts_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        limit: 100
      }
    );

    assert.ok(
      products_queried.length >= products.length,
      'pre-condition has failed'
    );

    assert.ok(
      products.every(
        p => products_queried.find(pq => pq.handle===p.handle)
      ),
      'discount was not applied to all positive discounts'
    );

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
