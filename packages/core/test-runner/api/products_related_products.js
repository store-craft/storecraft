/**
 * @import { ProductTypeUpsert } from '../../api/types.api.js'
 * @import { withConcreteIdAndHandle } from '../../database/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { App } from '../../index.js';
import { 
  create_handle, file_name, 
  get_static_ids, promises_sequence
} from './api.utils.crud.js';
import esMain from './utils.esmain.js';

const handle_pr = create_handle('pr', file_name(import.meta.url));


/** @type {withConcreteIdAndHandle<ProductTypeUpsert>} */
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

/** @type {ProductTypeUpsert[]} */
const related_product_for_upsert = [
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
        for(const p of related_product_for_upsert)
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
    const related_product_upserted_ids_and_handles = await promises_sequence(
      related_product_for_upsert.map(
        v => async () => (
          {
            // we only care for `id` and `handle`
            id: await app.api.products.upsert(v),
            handle: v.handle
          }
        )
      )
    )

    // console.log('ids', ids)

    // now, make the connection
    await app.db.resources.products.upsert(
      {
        ...pr_upsert,
        related_products: related_product_upserted_ids_and_handles
      }
    );


    // now query the product's discounts to see if discount was applied to 1st product
    const related_products = await app.api.products.list_all_related_products(
      pr_upsert.handle
    );

    // console.log('related_products', related_products)

    assert.ok(related_products.length>=related_product_for_upsert.length, 'got less')
    assert.ok(
      related_product_for_upsert.every(
        (v) => related_products.find(x => x.handle===v.handle)
      ), 
      'got less'
    );
  });

  s('remove the 1st related product and query again', async () => {
    // upsert 1st product straight to the db because we have ID
    const remove_handle = related_product_for_upsert[0].handle;

    await app.api.products.remove(
      remove_handle
    );
    
    // now query the product's discounts to see if discount was applied to 1st product
    const related_products = await app.api.products.list_all_related_products(
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
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
