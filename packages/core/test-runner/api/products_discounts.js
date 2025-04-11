/**
 * @import { } from '../../api/types.api.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
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
 * 
 * As opposed to `discounts -> products` tests, here we test the
 * other way `product -> discounts` by:
 * - First `upsert` the discount
 * - `upsert` positive products for the discount
 * - `upsert` negative products for the discount
 * - Then, query the products and confirm their attached `discounts`
 * 
 * @param {App} app 
 * 
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
    } = setup_for_discount_filter_product_in_handles();

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    // upsert products after discount
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products_positive.length + products_negative.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products_positive) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

    // confirm negative products don't have this discount
    for (const p of products_negative) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        !product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was mistakenly applied at a negative product with handle=${p.handle}` 
      );

    }
  
  });


  s('test product has NO handles', async () => {
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_NOT_in_handles();

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    // upsert products after discount
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products_positive.length + products_negative.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products_positive) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

    // confirm negative products don't have this discount
    for (const p of products_negative) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        !product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was mistakenly applied at a negative product with handle=${p.handle}` 
      );

    }
  
  });


  s('test product has tags', async () => {
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_in_tags();

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    // upsert products after discount
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products_positive.length + products_negative.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products_positive) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

    // confirm negative products don't have this discount
    for (const p of products_negative) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        !product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was mistakenly applied at a negative product with handle=${p.handle}` 
      );

    }
  
  });


  s('test product NOT has tags', async () => {
    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive
    } = setup_for_discount_filter_product_NOT_in_tags();

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    // upsert products after discount
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products_positive.length + products_negative.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products_positive) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

    // confirm negative products don't have this discount
    for (const p of products_negative) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        !product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was mistakenly applied at a negative product with handle=${p.handle}` 
      );

    }

  });


  s('test product in collections', async () => {

    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive,
      collections
    } = setup_for_discount_filter_product_in_collections();

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all collections
    for(const c of collections)
      await app.api.collections.remove(c.handle);

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    for(const c of collections)
      await app.api.collections.upsert(c);

    // upsert products after discount
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products_positive.length + products_negative.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products_positive) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

    // confirm negative products don't have this discount
    for (const p of products_negative) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        !product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was mistakenly applied at a negative product with handle=${p.handle}` 
      );

    }
  
  });


  s('test product NOT in collections', async () => {

    const now = (new Date()).toISOString();

    const {
      discount, products_negative, products_positive,
      collections
    } = setup_for_discount_filter_product_NOT_in_collections();

    assert.ok(
      products_negative?.length && products_positive?.length &&
      discount,
      'pre-condition has failed'
    );

    // remove all collections
    for(const c of collections)
      await app.api.collections.remove(c.handle);

    // remove all products
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    for(const c of collections)
      await app.api.collections.upsert(c);

    // upsert products after discount
    for(const p of [...products_negative, ...products_positive])
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products_positive.length + products_negative.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products_positive) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

    // confirm negative products don't have this discount
    for (const p of products_negative) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        !product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was mistakenly applied at a negative product with handle=${p.handle}` 
      );

    }

  });


  s('test product ALL filter and removal of discount effect', async () => {

    const now = (new Date()).toISOString();

    const {
      discount, products
    } = setup_for_discount_filter_product_all();

    assert.ok(
      products?.length && discount,
      'pre-condition has failed'
    );


    // remove all products
    for(const p of products)
      await app.api.products.remove(p.handle);

    await app.api.discounts.remove(discount.handle);

    // upsert discount
    await app.api.discounts.upsert(discount);

    // upsert products after discount
    for(const p of products)
      await app.api.products.upsert(p);

    // get all recent products
    const products_queried = await app.api.products.list(
      {
        startAt: [['updated_at', now]],
        sortBy: ['updated_at'],
        order: 'asc',
        limit: 1000,
        expand: ['*']
      }
    );

    assert.ok(
      products_queried.length >= (products.length),
      'pre-condition has failed'
    );

    // confirm positive products have this discount
    for (const p of products) {
      const product_found = products_queried.find(pr => pr.handle===p.handle);

      assert.ok(
        product_found &&
        product_found?.discounts?.find(dis => dis.handle===discount.handle),
        `Discount was not applied at a positive product with handle=${p.handle}` 
      );
    }

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
