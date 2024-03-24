import 'dotenv/config';
import { collections, products } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, promises_sequence } from './api.utils.crud.js';
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
   * @typedef {import('@storecraft/core/v-api').CollectionTypeUpsert} CollectionTypeUpsert
   * @typedef {import('@storecraft/core/v-api').ProductTypeUpsert} ProductTypeUpsert
   */

  /** @type {import('@storecraft/core/v-api').CollectionTypeUpsert[]} */
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

  /** @type {import('@storecraft/core/v-api').ProductTypeUpsert[]} */
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

  // return s;

  s('create', async () => {

    // upsert collections
    const cols = await promises_sequence(
      col_upsert.map(
        c => async () => {
          await collections.upsert(app, c);
          return collections.get(app, c.handle);
        }
      )
    );

    // upsert products
    const prs = await promises_sequence(
      pr_upsert.map(
        c => async () => {
          await products.upsert(app, c);
          return products.get(app, c.handle);
        }
      )
    );

    // console.log('prs', prs)
    // upsert products with collections relation
    for (const pr of prs) {
      await products.upsert(app, {
        ...pr, 
        collections: cols
      });
    }

    // console.log('prs', prs)
    // now query list of products of collection
    const products_queried = await collections.list_collection_products(
      app, col_upsert[0].handle,
      {
        startAt: [['id', prs[0].id]], 
        sortBy: ['id'],
      }
    );

    // console.log('products_queried', products_queried)
    // the first returned product should be the product
    assert.ok(
      products_queried?.[0]?.handle===prs[0].handle,
      `failed list_collection_products for collection handle ${col_upsert[0].handle}`
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
    console.log(e)

  }
})();
