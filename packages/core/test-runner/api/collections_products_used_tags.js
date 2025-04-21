/**
 * @import { CollectionTypeUpsert, ProductTypeUpsert } from '../../api/types.api.js'
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, promises_sequence } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { withTimestamp } from './utils.js';

const handle_col = create_handle('col', file_name(import.meta.url));
const handle_pr = create_handle('pr', file_name(import.meta.url));

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
  );


  /** @type {CollectionTypeUpsert} */
  const col_upsert = {
    active: true,
    handle: handle_col(),
    title: 'col 1',
  }

  /** @type {ProductTypeUpsert[]} */
  const pr_upsert = [
    {
      handle: handle_pr(),
      active: true,
      price: 50,
      qty: 1,
      title: 'product 1',
      tags: [withTimestamp('genre_action'), withTimestamp('genre_comedy')]
    },
    {
      handle: handle_pr(),
      active: true,
      price: 150,
      qty: 2,
      title: 'product 2',
      tags: [withTimestamp('color_red'), withTimestamp('color_white')]
    },
  ]

  s.before(
    async () => { 
      assert.ok(app.ready);

      try {

        // upsert collection
        await app.api.collections.remove(col_upsert.handle);
        const col_id = await app.api.collections.upsert(col_upsert);
        
        for(const p of pr_upsert) {
          await app.api.products.remove(p.handle);
          // upsert product and link to collection
          await app.api.products.upsert(
            {
              ...p,
              collections: [
                {
                  handle: col_upsert.handle,
                  id: col_id,
                }
              ]
            }
          );
        }
      } catch(e) {
        console.log(e);
        assert.unreachable('failed to create app');
      }
    }
  );

  // return s;

  s('collection->products->used-tags', async () => {

    // we test inclusion
    const tags = pr_upsert.map(p => p.tags).flat();
    const used_tags = await app.api.collections.list_used_products_tags(
      col_upsert.handle
    );

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
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
    console.log(e)

  }
})();
