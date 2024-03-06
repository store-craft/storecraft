import 'dotenv/config';
import { collections, products } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';

const handle_col = create_handle('col', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );

  /**
   * @typedef {import('@storecraft/core').CollectionTypeUpsert} CollectionTypeUpsert
   * @typedef {import('@storecraft/core').ProductTypeUpsert} ProductTypeUpsert
   */

  /** @type {import('@storecraft/core').CollectionTypeUpsert[]} */
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

  /** @type {import('@storecraft/core').ProductTypeUpsert[]} */
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
      assert.ok(app.ready);

      for(const p of pr_upsert)
        await products.remove(app, p.handle);
      for(const p of col_upsert)
        await collections.remove(app, p.handle);
    }
  );

  s('create', async () => {
    // upsert collections
    const cols = await Promise.all(
      col_upsert.map(
        async c => {
          await collections.upsert(app, c);
          return collections.get(app, c.handle);
        }
      )
    );

    // upsert products
    const prs = await Promise.all(
      pr_upsert.map(
        async c => {
          await products.upsert(app, c);
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
      }
    );

    // console.log(products_queried)
    // the first returned product should be the product
    assert.ok(products_queried[0].handle===prs[0].handle);

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
