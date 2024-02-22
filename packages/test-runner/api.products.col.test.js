import 'dotenv/config';
import { products, collections } from '@storecraft/core/v-api';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { assert_async_throws, assert_partial, create_app } from './utils.js';

const app = await create_app();

/** @type {import('@storecraft/core').CollectionTypeUpsert[]} */
const col_upsert = [
  {
    active: true,
    handle: 'col-1',
    title: 'col 1',
    tags: ['tag-1_a', 'tag-1_b']
  },
  {
    active: true,
    handle: 'col-2',
    title: 'col 2',
    tags: ['tag-1_a', 'tag-1_b']
  },
]

/** @type {import('@storecraft/core').ProductTypeUpsert[]} */
const pr_upsert = [
  {
    handle: 'pr-1',
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1',
  },
  {
    handle: 'pr-2',
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
  },
]

test.before(async () => { assert.ok(app.ready) });
test.after(async () => { await app.db.disconnect() });

test('create', async () => {
  // upsert collections
  const cols = await Promise.all(
    col_upsert.map(
      async c => {
        try { await collections.upsert(app, c); } catch (e) {};
        return collections.get(app, c.handle);
      }
    )
  );

  // upsert products
  const prs = await Promise.all(
    pr_upsert.map(
      async c => {
        try { await products.upsert(app, c); } catch (e) {};
        return products.get(app, c.handle);
      }
    )
  );

  // upsert products with collections relation
  for (const pr of prs) {
    await products.upsert(app, {
      ...pr, 
      collections: cols
    });
  }

  // test relation on the first product, we get what we put
  {
    const cols_of_pr = await products.list_product_collections(app, prs[0].handle);
    // console.log(JSON.stringify(cols_of_pr,null,2))
    assert.equal(cols_of_pr, cols);
  }

  // test collection delete, collection was deleted from product
  {
    await collections.remove(app, cols[0].id);
    const cols_of_pr = await products.list_product_collections(app, prs[0].handle);
    assert.equal(cols_of_pr, cols.slice(1));
  }

  // test collection update, collection was updated at product
  {
    const update_second_col = { ...cols[1], title: `random title ${Math.random().toFixed(2)}` }
    await collections.upsert(app, update_second_col);
    const cols_of_pr = await products.list_product_collections(app, prs[0].handle);
    assert.equal(cols_of_pr[0].title, update_second_col.title);
  }

});

test.run();
