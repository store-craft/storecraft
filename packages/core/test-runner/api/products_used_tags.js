/**
 * @import { ProductTypeUpsert } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  add_sanity_crud_to_test_suite, create_handle, file_name, 
  promises_sequence
} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { withTimestamp } from './utils.js';

const handle = create_handle('pr', file_name(import.meta.url));

/** @type {ProductTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle(),
    active: true,
    price: 50,
    qty: 1,
    title: 'product 1',
    tags: [withTimestamp('color_red')]
  },
  {
    handle: handle(),
    active: true,
    price: 150,
    qty: 2,
    title: 'product 2',
    tags: [withTimestamp('color_green')]
  },
  {
    handle: handle(),
    active: true,
    price: 250,
    qty: 3,
    title: 'product 3',
    tags: [withTimestamp('color_blue')]
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
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert) {
          await app.api.products.remove(p.handle);
          const id = await app.api.products.upsert(p);
          // const up = await app.api.products.get(id);
          // console.log({up})
        }
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );

  s('products used tags', async (ctx) => {
    // we test inclusion
    const tags = items_upsert.map(p => p.tags).flat();
    const used_tags = await app.api.products.list_used_products_tags();

    // console.log({used_tags})

    const contains = tags.every(
      tag => used_tags.includes(tag)
    )

    assert.ok(
      contains,
      `failed products.list_used_products_tags()`
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
