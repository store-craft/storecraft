/**
 * @import { 
 *  CollectionTypeUpsert, DiscountTypeUpsert, FilterValue_p_in_products, 
 *  OrderDataUpsert, OrderDiscountExtra, PostTypeUpsert, ProductTypeUpsert, 
 *  QuickSearchResult, ShippingMethodTypeUpsert, StorefrontTypeUpsert, 
 *  TagTypeUpsert 
 * } from '../../api/types.public.js'
 * 
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name, 
  get_static_ids} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { enums } from '../../api/index.js';

/**
 * The Test Strategy:
 * 
 * A sanity test, 
 * - we create two sets of resources with `A` and `B` unique tokens.
 * - we then query using `vql` on these tokens
 */

const A = 'tokenaaaaaaaa'
const B = 'tokenbbbbbbbb'

/** @type {TagTypeUpsert[]} */
const tags_upsert = [
  {
    handle: A,
    values: [A],
  },
  {
    handle: B,
    values: [B],
  },
]

/** @type {ProductTypeUpsert[]} */
const products_upsert = [
  {
    handle: A,
    title: A,
    active: true,
    price: 50,
    qty: 1,
  },
  {
    handle: B,
    title: B,
    active: true,
    price: 50,
    qty: 1,
  },
]

/** @type {CollectionTypeUpsert[]} */
const collections_upsert = [
  {
    handle: A,
    active: true,
    title: A
  },
  {
    handle: B,
    active: true,
    title: B
  },
]

/** @type {ShippingMethodTypeUpsert[]} */
const shipping_upsert = [
  {
    handle: A,
    active: true,
    price: 50,
    title: A
  },
  {
    handle: B,
    active: true,
    price: 50,
    title: B
  },
]

/** @type {StorefrontTypeUpsert[]} */
const storefronts_upsert = [
  {
    handle: A,
    active: true,
    title: A
  },
  {
    handle: B,
    active: true,
    title: B
  },
]

/** @type {PostTypeUpsert[]} */
const posts_upsert = [
  {
    handle: A,
    active: true,
    title: A,
    text: A
  },
  {
    handle: B,
    active: true,
    title: B, 
    text: B
  },
]

/** @type {OrderDataUpsert} */
const order_base = {
  pricing: {
    quantity_discounted: 0,
    quantity_total: 1,
    subtotal: 100,
    subtotal_discount: 0,
    subtotal_undiscounted: 100,
    total: 150
  },
  line_items: [
    {
      id: 'i-dont-exist',
      qty: 1,
      price: 100
    }
  ],
  shipping_method: {
    handle: 'i-dont-exist'
  },
  status: {
    checkout: enums.CheckoutStatusEnum.created,
    payment: enums.PaymentOptionsEnum.unpaid,
    fulfillment: enums.FulfillOptionsEnum.draft
  },
}

// orders don't have `handle`, therefore i need to come up
// with a valid `id` for this test, so i can evaluate better,
// because search results for `orders` are just their `ids`
const order_ids = get_static_ids('order');

/** @type {OrderDataUpsert[]} */
const orders_upsert = [
  {
    ...order_base,
    tags: [A],
    id: order_ids[0]
  },
  {
    ...order_base,
    tags: [B],
    id: order_ids[1]
  },
]

// this discount will not be applied to any product, which is important for the test

/** @type {DiscountTypeUpsert} */
const base_discount = {
  handle: undefined,
  title: undefined,
  active: true,
  application: enums.DiscountApplicationEnum.Auto,
  priority: 0,
  info: {
    details: {
      meta: enums.DiscountMetaEnum.order,
      /** @type {OrderDiscountExtra} */
      extra: {
        fixed: 0,
        percent: 10
      }
    },
    filters: [
      {
        meta: enums.FilterMetaEnum.p_in_products,
        /** @type {FilterValue_p_in_products} */
        value: [
          {
            id: 'i-dont-exist-sajsiajsiasi'
          }
        ]
      }
    ]
  }
}

/** @type {DiscountTypeUpsert[]} */
const discounts_upsert = [
  {
    ...base_discount,
    handle: A,
    title: A,
  },
  {
    ...base_discount,
    handle: B,
    title: B,
  }
]


/**
 * 
 * @description verify a quick search result against the A and B sets
 * 
 * @param {QuickSearchResult} result 
 * @param {'A' | 'B'} inClass
 * @param {'A' | 'B'} outClass
 */
const verify = (result, inClass, outClass) => {

  const INDEX_IN = inClass==='A' ? 0 : 1;
  const INDEX_OUT = outClass==='B' ? 1 : 0;

  const find_product = result.products.find(
    it => it.handle===products_upsert[INDEX_IN].handle
  ) && !result.products.find(
    it => it.handle===products_upsert[INDEX_OUT].handle
  );

  assert.ok(
    find_product,
    'product verification failed'
  );

  const find_collection = result.collections.find(
    it => it.handle===collections_upsert[INDEX_IN].handle
  ) && !result.collections.find(
    it => it.handle===collections_upsert[INDEX_OUT].handle
  );

  assert.ok(
    find_collection,
    'collection verification failed'
  );

  const find_tags = result.tags.find(
    it => it.handle===tags_upsert[INDEX_IN].handle
  ) && !result.tags.find(
    it => it.handle===tags_upsert[INDEX_OUT].handle
  );

  assert.ok(
    find_tags,
    'tag verification failed'
  );

  const find_discounts = result.discounts.find(
    it => it.handle===discounts_upsert[INDEX_IN].handle
  ) && !result.discounts.find(
    it => it.handle===discounts_upsert[INDEX_OUT].handle
  );

  assert.ok(
    find_discounts,
    'discount verification failed'
  );

  const find_posts = result.posts.find(
    it => it.handle===posts_upsert[INDEX_IN].handle
  ) && !result.posts.find(
    it => it.handle===posts_upsert[INDEX_OUT].handle
  );

  assert.ok(
    find_posts,
    'post verification failed'
  );

  const find_storefronts = result.storefronts.find(
    it => it.handle===storefronts_upsert[INDEX_IN].handle
  ) && !result.storefronts.find(
    it => it.handle===storefronts_upsert[INDEX_OUT].handle
  );

  assert.ok(
    find_storefronts,
    'storefront verification failed'
  );

  const find_orders = result.orders.find(
    it => it.id===orders_upsert[INDEX_IN].id
  ) && !result.orders.find(
    it => it.id===orders_upsert[INDEX_OUT].id
  );

  assert.ok(
    find_orders,
    'order verification failed'
  );

  return (
    find_collection && find_discounts && find_orders &&
    find_posts && find_product && find_storefronts && 
    find_tags
  )
}


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
      assert.ok(app.ready) 
      try {
        for(const p of products_upsert) {
          await app.api.products.remove(p.handle);
          await app.api.products.upsert(p);
        }

        for(const p of collections_upsert) {
          await app.api.collections.remove(p.handle);
          await app.api.collections.upsert(p);
        }
        
        for(const p of tags_upsert) {
          await app.api.tags.remove(p.handle);
          await app.api.tags.upsert(p);
        }
        
        for(const p of posts_upsert) {
          await app.api.posts.remove(p.handle);
          await app.api.posts.upsert(p);
        }

        for(const p of storefronts_upsert) {
          await app.api.storefronts.remove(p.handle);
          await app.api.storefronts.upsert(p);
        }

        for(const p of discounts_upsert) {
          await app.api.discounts.remove(p.handle);
          await app.api.discounts.upsert(p);
        }

        for(const p of orders_upsert)
          await app.api.orders.upsert(p);

      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );

  s('sanity', async () => {
    const resultA = await app.api.search.quicksearch(
      {
        limit: 5,
        vql: `${A} | tag:${A}`
      }
    );

    const resultB = await app.api.search.quicksearch(
      {
        limit: 5,
        vql: `${B} | tag:${B}`
      }
    );

    // console.log('resultA', resultA)
    // console.log('resultB', resultB)

    // now verify
    assert.ok(
      verify(resultA, 'A', 'B'),
      'result A failed'
    );

    assert.ok(
      verify(resultB, 'B', 'A'),
      'result B failed'
    );

  })

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
