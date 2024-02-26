import 'dotenv/config';
import { storefronts, products, collections, 
  discounts, posts, shipping } from '@storecraft/core/v-api';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App, DiscountApplicationEnum, DiscountMetaEnum, 
  FilterMetaEnum } from '@storecraft/core';
import { create_handle, file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';

// const app = await create_app();

/**
 * @typedef {import('@storecraft/core').StorefrontTypeUpsert} StorefrontTypeUpsert
 * @typedef {import('@storecraft/core').ProductTypeUpsert} ProductTypeUpsert
 * @typedef {import('@storecraft/core').CollectionTypeUpsert} CollectionTypeUpsert
 * @typedef {import('@storecraft/core').PostTypeUpsert} PostTypeUpsert
 * @typedef {import('@storecraft/core').ShippingMethodTypeUpsert} ShippingMethodTypeUpsert
 * @typedef {import('@storecraft/core').DiscountTypeUpsert} DiscountTypeUpsert
 */
const handle_sf = create_handle('sf', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));
const handle_col = create_handle('col', file_name(import.meta.url));
const handle_post = create_handle('post', file_name(import.meta.url));
const handle_ship = create_handle('ship', file_name(import.meta.url));
const handle_dis = create_handle('dis', file_name(import.meta.url));

/** @type {StorefrontTypeUpsert} */
const storefront_upsert = {
    handle: handle_sf(), title: 'sf 1'
}

/** @type {ProductTypeUpsert[]} */
const products_upsert = [
  {
    handle: handle_pr(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1'
  },
  {
    handle: handle_pr(),
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
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
  { handle: handle_ship(), name: 'ship 1', price: 50 },
  { handle: handle_ship(), name: 'ship 2', price: 50 },
]

/** @type {DiscountTypeUpsert[]} */
const discounts_upsert = [
  {
    active: false, application: DiscountApplicationEnum.Auto, 
    handle: handle_dis(), priority: 0, title: 'Fake Discount 1',
    info: {
      details: {
        meta: DiscountMetaEnum.bulk,
        extra: {
          qty: 3, fixed: 100, percent: 100
        }
      },
      filters: [
        {
          meta: FilterMetaEnum.p_in_handles,
          value: ['pr-non-existing-handle']
        }
      ]
    }
  },
  {
    active: false, application: DiscountApplicationEnum.Auto, 
    handle: handle_dis(), priority: 0, title: 'Fake Discount 2',
    info: {
      details: {
        meta: DiscountMetaEnum.bulk,
        extra: {
          qty: 3, fixed: 100, percent: 100
        }
      },
      filters: [
        {
          meta: FilterMetaEnum.p_in_handles,
          value: ['pr-non-existing-handle']
        }
      ]
    }
  },  
]

/** @type {PostTypeUpsert[]} */
const posts_upsert = [
  { handle: handle_post(), title: 'post 1', text: 'blah blah 1' },
  { handle: handle_post(), title: 'post 2', text: 'blah blah 2' },
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
        await posts.remove(app, p.handle);
      for(const p of discounts_upsert)
        await discounts.remove(app, p.handle);
      for(const p of shipping_upsert)
        await shipping.remove(app, p.handle);
      for(const p of collections_upsert)
        await collections.remove(app, p.handle);
      for(const p of products_upsert)
        await products.remove(app, p.handle);
      await storefronts.remove(app, storefront_upsert.handle);
    }
  );

  s.after(async () => { await app.db.disconnect() });

  s('create', async () => {
    // upsert products
    const collections_get = await Promise.all(
      collections_upsert.map(
        async c => {
          await collections.upsert(app, c);
          return collections.get(app, c.handle);
        }
      )
    );

    const products_get = await Promise.all(
      products_upsert.map(
        async c => {
          await products.upsert(app, c);
          return products.get(app, c.handle);
        }
      )
    );

    const shipping_get = await Promise.all(
      shipping_upsert.map(
        async c => {
          await shipping.upsert(app, c);
          return shipping.get(app, c.handle);
        }
      )
    );

    const posts_get = await Promise.all(
      posts_upsert.map(
        async c => {
          await posts.upsert(app, c);
          return posts.get(app, c.handle);
        }
      )
    );

    const discounts_get = await Promise.all(
      discounts_upsert.map(
        async c => {
          await discounts.upsert(app, c);
          return discounts.get(app, c.handle);
        }
      )
    );


    // now connect them to storefront
    // upsert products with collections relation
    await storefronts.upsert(app, storefront_upsert);
    const storefront_get = await storefronts.get(app, storefront_upsert.handle);
    // now, connect
    await storefronts.upsert(
      app,
      {
        ...storefront_get, 
        collections: collections_get,
        discounts: discounts_get,
        products: products_get,
        posts: posts_get,
        shipping_methods: shipping_get
      }
    );

    // now verify
    { // verify initial collections
      const queried = await storefronts.list_storefront_collections(
        app, storefront_upsert.handle
      );

      const verified = collections_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 'list collections does not include original collections !')
    }

    { // verify products
      const queried = await storefronts.list_storefront_products(
        app, storefront_upsert.handle
      );

      const verified = products_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 'list products does not include original items !')
    }

    { // verify discounts
      const queried = await storefronts.list_storefront_discounts(
        app, storefront_upsert.handle
      );

      const verified = discounts_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 'list discounts does not include original items !')
    }

    { // verify shipping
      const queried = await storefronts.list_storefront_shipping_methods(
        app, storefront_upsert.handle
      );

      const verified = shipping_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 'list shipping does not include original items !')
    }

    { // verify posts
      const queried = await storefronts.list_storefront_posts(
        app, storefront_upsert.handle
      );

      const verified = posts_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 'list posts does not include original items !')
    }

    // AFTER DELETE OF CONNECTIONS
    // strategy:
    // - delete the first item of connections (products/collections/discounts/shipping/posts  ..)
    // - verify that on query of storefront, they are not there
    { // verify after delete
      // delete the first collection
      const collection_id_to_remove = collections_get.at(0).id;
      const product_id_to_remove = products_get.at(0).id;
      const discount_id_to_remove = discounts_get.at(0).id;
      const shipping_id_to_remove = shipping_get.at(0).id;
      const post_id_to_remove = posts_get.at(0).id;

      await collections.remove(app, collection_id_to_remove);
      await products.remove(app, product_id_to_remove);
      await discounts.remove(app, discount_id_to_remove);
      await shipping.remove(app, shipping_id_to_remove);
      await posts.remove(app, post_id_to_remove);

      {
        let queried = await storefronts.list_storefront_collections(
          app, storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===collection_id_to_remove), 
          'list collections does not include original collections !'
        );
      }
      //
      {
        let queried = await storefronts.list_storefront_discounts(
          app, storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===discount_id_to_remove), 
          'list discounts does not include original collections !'
        );
      }
      //
      {
        let queried = await storefronts.list_storefront_posts(
          app, storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===post_id_to_remove), 
          'list posts does not include original collections !'
        );
      }
      //
      {
        let queried = await storefronts.list_storefront_products(
          app, storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===product_id_to_remove), 
          'list products does not include original collections !'
        );
      }
      //
      {
        let queried = await storefronts.list_storefront_shipping_methods(
          app, storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===shipping_id_to_remove), 
          'list shipping does not include original collections !'
        );
      }

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
    create(app).run();
  } catch (e) {
  }
})();
