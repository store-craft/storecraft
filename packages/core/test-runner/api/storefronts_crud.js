/**
 * @import { StorefrontType, StorefrontTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle_sf = create_handle('sf', file_name(import.meta.url));

/** @type {StorefrontTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle_sf(), title: 'sf 1', active: true
  },
  {
    handle: handle_sf(), title: 'sf 2', active: true
  },
  {
    handle: handle_sf(), title: 'sf 3', active: true
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<StorefrontType, StorefrontTypeUpsert>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.storefronts,
      events: {
        get_event: 'storefronts/get',
        upsert_event: 'storefronts/upsert',
        remove_event: 'storefronts/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await app.api.storefronts.remove(p.handle);
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
    const { create_app } = await import('./play.js');
    const app = await create_app();
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
