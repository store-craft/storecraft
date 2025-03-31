/**
 * @import { ShippingMethodType, ShippingMethodTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { add_sanity_crud_to_test_suite, 
  create_handle, file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';

const handle = create_handle('ship', file_name(import.meta.url));

/** @type {ShippingMethodTypeUpsert[]} */
const items_upsert = [
  {
    handle: handle(), title: 'ship 1', price: 50
  },
  {
    handle: handle(), title: 'ship 2', price: 50
  },
  {
    handle: handle(), title: 'ship 3', price: 50
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<ShippingMethodType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, app, ops: app.api.shipping_methods,
      events: {
        get_event: 'shipping/get',
        upsert_event: 'shipping/upsert',
        remove_event: 'shipping/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert)
          await app.api.shipping_methods.remove(p.handle);
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
