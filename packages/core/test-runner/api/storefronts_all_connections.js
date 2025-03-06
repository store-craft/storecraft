/**
 * @import { 
 *  CollectionTypeUpsert, DiscountTypeUpsert, PostTypeUpsert, 
 *  ProductTypeUpsert, ShippingMethodTypeUpsert, StorefrontTypeUpsert 
 * } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * 
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { enums } from '../../api/index.js';
import { create_handle, file_name, promises_sequence } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';


const handle_sf = create_handle('sf', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));
const handle_col = create_handle('col', file_name(import.meta.url));
const handle_post = create_handle('post', file_name(import.meta.url));
const handle_ship = create_handle('ship', file_name(import.meta.url));
const handle_dis = create_handle('dis', file_name(import.meta.url));

/** @type {StorefrontTypeUpsert} */
const storefront_upsert = {
    handle: handle_sf(), title: 'sf 1',
    active: true
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
  { handle: handle_ship(), title: 'ship 1', price: 50 },
  { handle: handle_ship(), title: 'ship 2', price: 50 },
]

/** @type {DiscountTypeUpsert[]} */
const discounts_upsert = [
  {
    active: false, 
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
          value: ['pr-non-existing-handle']
        }
      ]
    }
  },
  {
    active: false, 
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
        await app.api.posts.remove(p.handle);
      for(const p of discounts_upsert)
        await app.api.discounts.remove(p.handle);
      for(const p of shipping_upsert)
        await app.api.shipping_methods.remove(p.handle);
      for(const p of collections_upsert)
        await app.api.collections.remove(p.handle);
      for(const p of products_upsert)
        await app.api.products.remove(p.handle);
      await app.api.storefronts.remove(storefront_upsert.handle);
    }
  );

  s('create', async () => {
    // upsert products
    const collections_get = await promises_sequence(
      collections_upsert.map(
        c => async () => {
          await app.api.collections.upsert(c);
          return app.api.collections.get(c.handle);
        }
      )
    );

    const products_get = await promises_sequence(
      products_upsert.map(
        c => async () => {
          await app.api.products.upsert(c);
          return app.api.products.get(c.handle);
        }
      )
    );

    const shipping_get = await promises_sequence(
      shipping_upsert.map(
        c => async () => {
          await app.api.shipping_methods.upsert(c);
          return app.api.shipping_methods.get(c.handle);
        }
      )
    );

    const posts_get = await promises_sequence(
      posts_upsert.map(
        c => async () => {
          await app.api.posts.upsert(c);
          return app.api.posts.get(c.handle);
        }
      )
    );

    const discounts_get = await promises_sequence(
      discounts_upsert.map(
        c => async () => {
          await app.api.discounts.upsert(c);
          return app.api.discounts.get(c.handle);
        }
      )
    );


    // now connect them to storefront
    // upsert products with collections relation
    await app.api.storefronts.upsert(storefront_upsert);
    const storefront_get = await app.api.storefronts.get(
      storefront_upsert.handle
    );

    // now, connect
    await app.api.storefronts.upsert(
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
      const queried = await app.api.storefronts.list_storefront_collections(
        storefront_upsert.handle
      );

      const verified = collections_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 
        'list collections does not include original collections !')
    }

    { // verify products
      const queried = await app.api.storefronts.list_storefront_products(
        storefront_upsert.handle
      );

      const verified = products_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 
        'list products does not include original items !')
    }

    { // verify discounts
      const queried = await app.api.storefronts.list_storefront_discounts(
        storefront_upsert.handle
      );

      const verified = discounts_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 
        'list discounts does not include original items !')
    }

    { // verify shipping
      const queried = await app.api.storefronts.list_storefront_shipping_methods(
        storefront_upsert.handle
      );

      const verified = shipping_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 
        'list shipping does not include original items !')
    }

    { // verify posts
      const queried = await app.api.storefronts.list_storefront_posts(
        storefront_upsert.handle
      );

      const verified = posts_upsert.every(
        c => queried.some(q => q.handle===c.handle)
      )
      assert.ok(verified, 
        'list posts does not include original items !')
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

      await app.api.collections.remove(collection_id_to_remove);
      await app.api.products.remove(product_id_to_remove);
      await app.api.discounts.remove(discount_id_to_remove);
      await app.api.shipping_methods.remove(shipping_id_to_remove);
      await app.api.posts.remove(post_id_to_remove);

      {
        let queried = await app.api.storefronts.list_storefront_collections(
          storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===collection_id_to_remove), 
          'list collections does not include original collections !'
        );
      }
      //
      {
        let queried = await app.api.storefronts.list_storefront_discounts(
          storefront_upsert.handle
        );

        assert.not(
          queried.find(q => q.id===discount_id_to_remove), 
          'list discounts does not include original collections !'
        );
      }
      //
      {
        let queried = await app.api.storefronts.list_storefront_posts(
          storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===post_id_to_remove), 
          'list posts does not include original collections !'
        );
      }
      //
      {
        let queried = await app.api.storefronts.list_storefront_products(
          storefront_upsert.handle
        );
        assert.not(
          queried.find(q => q.id===product_id_to_remove), 
          'list products does not include original collections !'
        );
      }
      //
      {
        let queried = await app.api.storefronts.list_storefront_shipping_methods(
          storefront_upsert.handle
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
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
