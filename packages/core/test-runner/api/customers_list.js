/**
 * @import { CustomerType } from '../../api/types.api.js'
 * @import { idable_concrete } from '../../database/types.public.js'
 * @import { ApiQuery } from '../../api/types.api.query.js'
 * @import { PubSubEvent } from '../../pubsub/types.public.js'
 * @import { ListTestContext } from './api.utils.crud.js';
 * @import { Test } from 'uvu';
 * 
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { create_handle, file_name, 
  iso, add_list_integrity_tests} from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { ID } from '../../api/utils.func.js';

// In this test, we will test the query list function.
// In order to create syntatic data with controlled dates,
// we will write straight to the databse, bypassing the
// virtual api of storecraft for insertion

/** 
 * @type {(CustomerType & idable_concrete)[]} 
 */
const items = Array.from({length: 10}).map(
  (_, ix, arr) => {
    // 5 last items will have the same timestamps
    let jx = Math.min(ix, arr.length - 3);
    return {
      email: `user_${ix}@sc.com`, firstname: `first name ${ix}`, 
      lastname: `last name ${ix}`,
      id: ID('cus'),
      created_at: iso(jx + 1),
      updated_at: iso(jx + 1)
    }
  }
);


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<ListTestContext<CustomerType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items, app, ops: app.api.customers,
      resource: 'customers', events: { list_event: 'customers/list' }
    }
  );
  

  s.before(
    async (a) => { 
      assert.ok(app.ready) 
      try {
        for(const p of items) {
          const success = await app.api.customers.remove(p.email);

          // we bypass the api and upsert straight
          // to the db because we control the time-stamps
          await app.db.resources.customers.upsert(p);
        }
      } catch(e) {
        console.log(e)
        throw e;
      }
    }
  );

  add_list_integrity_tests(s);

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

