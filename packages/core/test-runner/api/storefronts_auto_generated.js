/**
 * @import { 
 *  CollectionTypeUpsert, DiscountTypeUpsert, FilterValue_p_in_products, PostTypeUpsert, 
 *  ProductTypeUpsert, ShippingMethodTypeUpsert, 
 * } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '../../api/index.js';
import { create_handle, file_name, promises_sequence } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { assert_partial_v2, withTimestamp } from './utils.js';

const handle_pr = create_handle('pr', file_name(import.meta.url));
const handle_col = create_handle('col', file_name(import.meta.url));
const handle_post = create_handle('post', file_name(import.meta.url));
const handle_ship = create_handle('ship', file_name(import.meta.url));
const handle_dis = create_handle('dis', file_name(import.meta.url));

/** @type {ProductTypeUpsert[]} */
const products_upsert = [
  {
    handle: handle_pr(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1',
    tags: [withTimestamp('tag-1_a'), withTimestamp('tag-1_b')],
  },
  {
    handle: handle_pr(),
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
    tags: [withTimestamp('tag-2_a'), withTimestamp('tag-2_b')],
  }
]

/** @type {CollectionTypeUpsert[]} */
const collections_upsert = [
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

/** @type {ShippingMethodTypeUpsert[]} */
const shipping_upsert = [
  { handle: handle_ship(), title: 'ship 1', price: 50, active: true },
  { handle: handle_ship(), title: 'ship 2', price: 50, active: true },
]

/** @type {DiscountTypeUpsert[]} */
const discounts_upsert = [
  {
    active: true, 
    application: enums.DiscountApplicationEnum.Auto, 
    handle: handle_dis(), priority: 0, title: 'Fake Discount 1',
    info: {
      details: {
        meta: enums.DiscountMetaEnum.bulk,
        extra: {
          qty: 3, fixed: 100, percent: 100
        }
      },
      filters: [
        {
          meta: enums.FilterMetaEnum.p_in_products,
          value: /** @type {FilterValue_p_in_products} */ (
            [
              {
                handle: 'pr-non-existing-handle',
                id: 'pr-non-existing-id',
              }
            ]
          )
        }
      ]
    }
  },
  {
    active: true, 
    application: enums.DiscountApplicationEnum.Auto, 
    handle: handle_dis(), priority: 0, title: 'Fake Discount 2',
    info: {
      details: {
        meta: enums.DiscountMetaEnum.bulk,
        extra: {
          qty: 3, fixed: 100, percent: 100
        }
      },
      filters: [
        {
          meta: enums.FilterMetaEnum.p_in_products,
          value: /** @type {FilterValue_p_in_products} */ (
            [
              {
                handle: 'pr-non-existing-handle',
                id: 'pr-non-existing-id',
              }
            ]
          )
        }
      ]
    }
  },  
]

/** @type {PostTypeUpsert[]} */
const posts_upsert = [
  { 
    handle: handle_post(), title: 'post 1', 
    text: 'blah blah 1', active: true 
  },
  { 
    handle: handle_post(), title: 'post 2', 
    text: 'blah blah 2', active: true 
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url)
  );
    
  s.before(
    async () => { 
      assert.ok(app.ready) ;

      for(const p of posts_upsert)
        await app.api.posts.remove(p.handle);
      for(const p of discounts_upsert)
        await app.api.discounts.remove(p.handle);
      for(const p of shipping_upsert)
        await app.api.shipping_methods.remove(p.handle);
      for(const p of collections_upsert)
        await app.api.collections.remove(p.handle);
      for(const p of products_upsert)
        await app.api.products.remove(p.handle);
    }
  );

  s('storefront auto generated', async () => {

    // we upsert and fetch to get a better picture to later compare
    // so we can see for example that discounts in a product were
    // also fetched in the storefront.
    const expected = {
      posts: await promises_sequence(
        posts_upsert.map(
          p => async () => {
            await app.api.posts.upsert(p);
            return app.api.posts.get(p.handle);
          }
        )
      ),
      products: await promises_sequence(
        products_upsert.map(
          p => async () => {
            await app.api.products.upsert(p);
            return app.api.products.get(p.handle);
          }
        )
      ),
      collections: await promises_sequence(
        collections_upsert.map(
          p => async () => {
            await app.api.collections.upsert(p);
            return app.api.collections.get(p.handle);
          }
        )
      ),
      discounts: await promises_sequence(
        discounts_upsert.map(
          p => async () => {
            await app.api.discounts.upsert(p);
            return app.api.discounts.get(p.handle);
          }
        )
      ),
      shipping_methods: await promises_sequence(
        shipping_upsert.map(
          p => async () => {
            await app.api.shipping_methods.upsert(p);
            return app.api.shipping_methods.get(p.handle);
          }
        )
      )
    }

    const sf = await app.api.storefronts.get_default_auto_generated_storefront();

    // console.log({expected_posts: expected.posts})
    // console.log({actual_posts: sf.posts})

    // now, let's see if we got everything we need
    // NOTE: in the future, if tests are not passing, may be i should
    // relax the assert_partial_v2 to not check for the `search` key
    // or relax completely by just testing for existance.

    {
      for(const [resource, items] of Object.entries(expected)) {
        for(const expected_item of items) {
          const actual_item = sf[resource].find(
            x => x.handle === expected_item.handle
          );

          if('search' in expected_item)
            delete expected_item.search;

          assert_partial_v2(
            actual_item,
            expected_item,
            `${expected_item.handle} in ${resource} has a match problem`
          );
        }
      }
    }

    { // now test used tags
      assert.equal(
        new Set(sf.all_used_products_tags),
        new Set(await app.api.products.list_used_products_tags()),
        'all_used_products_tags is not equal to used products tags'
      );
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
