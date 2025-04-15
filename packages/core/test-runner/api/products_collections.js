/**
 * @import { CollectionTypeUpsert, ProductTypeUpsert } from '../../api/types.api.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, promises_sequence } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { assert_partial, assert_partial_minus_relations } from './utils.js';

const handle_col = create_handle('col', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));

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

      for(const p of pr_upsert)
        await app.api.products.remove(p.handle);
      for(const p of col_upsert)
        await app.api.collections.remove(p.handle);
    }
  );

  s('test products->collections', async () => {
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

    // upsert products with collections relation
    for (const pr of prs) {
      await app.api.products.upsert(
        {
          ...pr, 
          collections: cols
        }
      );
    }

    // test relation on the first product, we get what we put
    {
      const cols_of_pr = await app.api.products.get(prs[0].handle).then(pr => pr.collections);
      // console.log(JSON.stringify(cols_of_pr,null,2))
      for (const expected of cols) {
        const actual = cols_of_pr.find(c => c.handle===expected.handle);
        assert_partial_minus_relations()(actual, expected);
      }
    }

    // simple get with exapnd collections, should also return the collections
    { 
      const product_with_collections = await app.api.products.get(
        prs[0].handle, 
        { expand: ['*'] }
      );
      
      // console.log(JSON.stringify(product_with_collections, null, 2))
      for (const expected of cols) {
        const actual = product_with_collections.collections.find(
          c => c.handle===expected.handle
          );
        assert_partial_minus_relations()(actual, expected);
      }
    }

    // test collection delete, collection was deleted from product
    {
      await app.api.collections.remove(cols[0].id);
      const cols_of_pr = await app.api.products.get(prs[0].handle).then(pr => pr.collections);
      assert_partial_minus_relations()(cols_of_pr, cols.slice(1));
    }

    // test collection update, collection was updated at product
    {
      const update_second_col = { ...cols[1], title: `random title ${Math.random().toFixed(2)}` }
      await app.api.collections.upsert(update_second_col);
      const cols_of_pr = await app.api.products.get(prs[0].handle).then(pr => pr.collections);
      assert.equal(cols_of_pr[0].title, update_second_col.title);
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
