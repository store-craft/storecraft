/**
 * @import { ProductType } from '../../api/types.api.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.js';
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
} from './fixtures_discounts_products.js';

/**
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );

  s.before(
    async () => { 
      assert.ok(app.ready);
    }
  );


  s('test product has handles', async () => {

    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_in_handles()

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    /** @type {ApiQuery<ProductType>} */
    const query = {
      startAt: [['updated_at', now]],
      sortBy: ['updated_at'],
      order: 'asc',
      limit: 1000
    };

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      query
    );

    assert.ok(
      products_queried.length >= products_positive.length,
      'pre-condition has failed'
    );

    { // test discount->products query count on the way
      const products_queried_count = await app.api.discounts.count_discount_products_query(
        discount.handle,
        query
      );

      assert.ok(
        products_queried_count == products_positive.length,
        'count_discount_products_query returned wrong count'
      )
    }

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
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_NOT_in_handles()

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
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
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_in_tags()

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
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
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_NOT_in_tags()

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
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
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive,
      collections
    } = setup_for_discount_filter_product_in_collections()

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount && collections?.length,
      'pre-condition has failed'
    );

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

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
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
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive,
      collections
    } = setup_for_discount_filter_product_NOT_in_collections()

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount && collections?.length,
      'pre-condition has failed'
    );

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

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
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


  s('test product ALL filter and removal of discount effect', async () => {
    const now = (new Date()).toISOString();

    const {
      discount, products
    } = setup_for_discount_filter_product_all()

    assert.ok(
      products?.length,
      'pre-condition has failed'
    );

    // remove all 
    for(const p of products)
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert products
    for(const p of products)
      await app.api.products.upsert(p);

    // upsert discount
    await app.api.discounts.upsert(discount);

    const products_queried = await app.api.discounts.list_discount_products(
      discount.handle,
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
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

    { // remove discount
      await app.api.discounts.remove(discount.handle);

      // fetch products
      for(const p of products) {
        const pr_get = await app.api.products.get(p.handle);
        assert.ok(
          pr_get.discounts.every(
            dis => dis.handle!==discount.handle
          ),
          'discount was removed but products still show it is attached'
        )
      }
  

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
