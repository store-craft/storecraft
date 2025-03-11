/**
 * @import { ProductType, ProductTypeUpsert } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * @import { ListTestContext, CrudTestContext } from './api.utils.crud.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  add_sanity_crud_to_test_suite, create_handle, file_name, 
  promises_sequence
} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle = create_handle('pr', file_name(import.meta.url));

/** @type {ProductTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1'
  },
  {
    handle: handle(),
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
  },
  {
    handle: handle(),
    active: true,
    price: 250,
    qty: 3,
    title: 'product 3',
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<ProductType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.products,
      events: {
        get_event: 'products/get',
        upsert_event: 'products/upsert',
        remove_event: 'products/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await app.api.products.remove(p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );

  add_sanity_crud_to_test_suite(s);

  s('change stock of', async (ctx) => {
    const items = [
      {
        handle: 'pr-stock-test-1',
        active: true,
        price: 250,
        qty: 2,
        title: 'product stock test 1',
      },
      {
        handle: 'pr-stock-test-2',
        active: true,
        price: 250,
        qty: 3,
        title: 'product stock test 2',
      },
    ];

    for(const item of items) {
      await app.api.products.remove(item.handle);
    }

    const ids = await promises_sequence(
      items.map(
        item => () => app.api.products.upsert(item)
      )
    );

    const deltas = [-1, -1];

    await app.api.products.changeStockOfBy(
      ids,
      deltas
    );

    const items_get = await promises_sequence(
      ids.map(
        id => () => app.api.products.get(id)
      )
    );

    const expected_qtys = items.map((item, ix) => item.qty + deltas[ix]);
    const actual_qtys = items_get.map(item => item.qty);

    assert.equal(
      actual_qtys, expected_qtys, 'changed quantities do not match'
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
