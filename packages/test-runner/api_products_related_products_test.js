import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App } from '@storecraft/core';
import { 
  create_handle, file_name, 
  get_static_ids, promises_sequence
} from './api.utils.crud.js';
import esMain from './utils.esmain.js';

const handle_pr = create_handle('pr', file_name(import.meta.url));


/** @type {import('@storecraft/core/v-api').ProductTypeUpsert} */
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

/** @type {import('@storecraft/core/v-api').ProductTypeUpsert[]} */
const related_product_upsert = [
  {
    handle: handle_pr(),
    active: true,
    price: 50,
    qty: 1,
    title: `tshirt variant 1 - red color`,
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
        for(const p of related_product_upsert)
          await app.api.products.remove(p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );
  // return s;

  s('basic upsert of related products test', async () => {
    // upsert 1st product straight to the db because we have ID
    await app.db.resources.products.upsert(pr_upsert);

    // upsert all variants
    const ids = await promises_sequence(
      related_product_upsert.map(v => () => app.api.products.upsert(v))
    )

    // console.log('ids', ids)

    // now, make the connection
    await app.db.resources.products.upsert(
      {
        ...pr_upsert,
        related_products: ids.map(id => ({ id }))
      }
    );


    // now query the product's discounts to see if discount was applied to 1st product
    const related_products = await app.api.products.list_related_products(
      pr_upsert.handle
    );

    // console.log('related_products', related_products)

    assert.ok(related_products.length>=related_product_upsert.length, 'got less')
    assert.ok(
      related_product_upsert.every(
        (v) => related_products.find(x => x.handle===v.handle)
      ), 
      'got less'
    );
  });

  s('remove the 1st related product and query again', async () => {
    // upsert 1st product straight to the db because we have ID
    const remove_handle = related_product_upsert[0].handle;

    await app.api.products.remove(
      remove_handle
    );
    
    // now query the product's discounts to see if discount was applied to 1st product
    const related_products = await app.api.products.list_related_products(
      pr_upsert.handle
    ) ?? [];

    assert.ok(
      related_products.every((v, ix) => remove_handle!==v.handle ), 
      'removed a related product but it still appears in relation'
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
  }
})();
