/**
 * @import { 
 *  CollectionTypeUpsert, ProductTypeUpsert 
 * } from '../../api/types.api.js'
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  create_handle, file_name, promises_sequence 
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle_col = create_handle(
  'col', file_name(import.meta.url)
);

const handle_pr = create_handle(
  'pr', file_name(import.meta.url)
);

/**
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );

  /** @type {CollectionTypeUpsert[]} */
  const col_upsert = [
    {
      active: true,
      handle: handle_col(),
      title: 'col 1',
      tags: ['tag-1_a', 'tag-1_b']
    },
    {
      active: true,
      handle: handle_col(),
      title: 'col 2',
      tags: ['tag-1_a', 'tag-1_b']
    },
  ]

  /** @type {ProductTypeUpsert[]} */
  const pr_upsert = [
    {
      handle: handle_pr(),
      active: true,
      price: 50,
      qty: 1,
      title: 'product 1',
    },
    {
      handle: handle_pr(),
      active: true,
      price: 150,
      qty: 2,
      title: 'product 2',
    },
  ]

  s.before(
    async () => { 
      assert.ok(app.isready);

      for(const p of pr_upsert)
        await app.api.products.remove(p.handle);
      for(const p of col_upsert)
        await app.api.collections.remove(p.handle);
    }
  );

  s('collections->products query', async () => {

    // upsert collections
    const cols = await promises_sequence(
      col_upsert.map(
        c => async () => {
          await app.api.collections.upsert(c);
          return app.api.collections.get(c.handle);
        }
      )
    );

    // upsert products
    const prs = await promises_sequence(
      pr_upsert.map(
        c => async () => {
          await app.api.products.upsert(c);
          return app.api.products.get(c.handle);
        }
      )
    );

    // console.log('prs', prs)
    // upsert products with collections relation
    for (const pr of prs) {
      await app.api.products.upsert({
        ...pr, 
        collections: cols
      });
    }

    // console.log('prs', prs)
    // now query list of products of collection
    const products_queried = await app.api.collections.list_collection_products(
      col_upsert[0].handle,
      {
        vql: {
          id: {
            $gte: prs[0].id,
          }
        },
        sortBy: ['id'],
        order: 'asc'
      }
    );

    // console.log('products_queried', products_queried)

    // the first returned product should be the product
    assert.ok(
      products_queried?.[0]?.handle===prs[0].handle,
      `failed list_collection_products for collection handle ${col_upsert[0].handle}`
    );

  });

  s('count collections->products query', async () => {
    const count = await app.api.collections.count_collection_products_query(
      col_upsert[0].handle, {}
    );

    assert.ok(
      count>=col_upsert.length, 
      'count_collection_products_query failed'
    );

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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
    console.log(e)

  }
})();
