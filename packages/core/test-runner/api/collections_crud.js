/**
 * @import { CollectionType, CollectionTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, 
  create_handle, 
  file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle = create_handle('col', file_name(import.meta.url));

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {CollectionTypeUpsert[]} */
  const items_upsert = [
    {
      active: true,
      handle: handle(),
      title: 'col 1',
      tags: ['tag-1_a', 'tag-1_b']
    },
    {
      active: true,
      handle: handle(),
      title: 'col 2',
      tags: ['tag-1_a', 'tag-1_b']
    },
    {
      active: true,
      handle: handle(),
      title: 'col 3',
      tags: ['tag-1_a', 'tag-1_b']
    },
  ]


  /** @type {Test<CrudTestContext<CollectionType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.collections,
      events: {
        get_event: 'collections/get',
        upsert_event: 'collections/upsert',
        remove_event: 'collections/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await app.api.collections.remove(p.handle);
      } catch(e) {
        console.log(e)
        throw e;
      }

    }
  );

  add_sanity_crud_to_test_suite(s);
  
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
