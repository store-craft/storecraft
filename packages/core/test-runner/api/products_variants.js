/**
 * @import { ProductType, VariantTypeUpsert } from '../../api/types.api.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App } from '../../index.js';
import { 
  create_handle, file_name, 
  get_static_ids, 
  promises_sequence
} from './api.utils.js';
import esMain from './utils.esmain.js';

const handle_pr = create_handle('pr', file_name(import.meta.url));
const handle_var = create_handle('var', file_name(import.meta.url));

/** @type {ProductType} */
const pr_upsert = {
  id: get_static_ids('pr').at(0),
  handle: handle_pr(),
  active: true,
  price: 50,
  qty: 1,
  title: `T-shirt`,
  variants_options: [
    {
      id: 'id-option-1',
      name: 'color',
      values: [
        { id:'id-val-1', value: 'red' },
        { id:'id-val-2', value: 'green' }
      ]
    }
  ],
}

/** @type {VariantTypeUpsert[]} */
const var_upsert = [
  {
    handle: handle_var(),
    active: true,
    price: 50,
    qty: 1,
    title: `tshirt variant 1 - red color`,
    parent_handle: pr_upsert.handle,    
    parent_id: pr_upsert.id,    
    variant_hint: [
      { // red color
        option_id: pr_upsert.variants_options[0].id,
        value_id: pr_upsert.variants_options[0].values[0].id,
      }
    ]
  },
  {
    handle: handle_var(),
    active: true,
    price: 50,
    qty: 1,
    title: `tshirt variant 2 - green color`,
    parent_handle: pr_upsert.handle,    
    parent_id: pr_upsert.id,    
    variant_hint: [
      { // green color
        option_id: pr_upsert.variants_options[0].id,
        value_id: pr_upsert.variants_options[0].values[1].id,
      }
    ]
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
      try {
        await app.api.products.remove(pr_upsert.handle);
        for(const p of var_upsert)
          await app.api.products.remove(p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );
  // return s;

  s('upsert 1st product -> upsert both variants -> test variants were applied', async () => {
    // upsert 1st product straight to the db because we have ID
    await app.db.resources.products.upsert(pr_upsert);
    // upsert all variants
    const ids = await promises_sequence(
      var_upsert.map(v => () => app.api.products.upsert(v))
    )

    // now query the product's discounts to see if discount was applied to 1st product
    const product_variants = await app.api.products.get(
      pr_upsert.handle
    ).then(/** @param {ProductType} pr */(pr) => pr.variants ?? []);

    // console.log(product_variants)

    assert.ok(product_variants.length>=var_upsert.length, 'got less')
  });

  s('resave 1st product -> test variants are still there', async () => {
    // upsert 1st product straight to the db because we have ID
    await app.db.resources.products.upsert(pr_upsert);

    // now query the product's discounts to see if discount was applied to 1st product
    const product_variants = await app.api.products.get(
      pr_upsert.handle
    ).then(/** @param {ProductType} pr */(pr) => pr.variants ?? []);

    // console.log(product_variants)

    assert.ok(product_variants.length>=var_upsert.length, 'got less')
  });

  // return s;

  s('remove 2nd variant -> test only one variant for product', async () => {
    await app.api.products.remove(var_upsert[0].handle);
    // now query the product's discounts to see if 
    // discount was applied to 1st product
    const product_variants = await app.api.products.get(
      pr_upsert.handle
    ).then(/** @param {ProductType} pr */(pr) => pr.variants ?? []);

    // console.log(product_variants)
    const first_variant_is_gone = product_variants.every(
      p => p.handle!==var_upsert[0].handle
    )
    assert.ok(first_variant_is_gone, 
      'First variant was removed,  but still apears in product variants')
  });

  s('remove product -> confirm all the variants are gone', async () => {
    await app.api.products.remove(pr_upsert.handle);
    // now query the product's discounts to see if 
    // discount was applied to 1st product
    const product_variants = await app.api.products.get(
      pr_upsert.handle
    ).then(/** @param {ProductType} pr */(pr) => pr?.variants ?? []);
    assert.ok(product_variants.length==0, 
      'product removed, but it\'s variants are in place');

    const variants_explicit = await Promise.all(
      var_upsert.map(v => app.api.products.get(v.handle))
    )
    assert.ok(
      variants_explicit.filter(Boolean).length==0, 
      'product removed, but it\'s variants are in place'
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
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
