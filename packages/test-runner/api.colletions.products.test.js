import 'dotenv/config';
import { collections, products } from '@storecraft/core/v-api';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { create_app } from './utils.js';

const app = await create_app();

/**
 * @typedef {import('@storecraft/core').CollectionTypeUpsert} CollectionTypeUpsert
 * @typedef {import('@storecraft/core').ProductTypeUpsert} ProductTypeUpsert
 */

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

  // now query list of products of discount
  const products_queried = await collections.list_collection_products(
    app, col_upsert[0].handle,
    {
      startAt: [['id', prs[0].id]], 
      sortBy: ['id'],
      limit: 1
    }
  );

  // console.log(products_queried)
  // the first returned product should be the product
  assert.ok(products_queried[0].handle===prs[0].handle);

});

test.run();
