/**
 * @import { CustomerType, CustomerTypeUpsert } from '../../api/types.api.js'
 * @import { CrudTestContext } from './api.utils.types.js';
 * @import { Test } from 'uvu';
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { 
  file_name, withRandom, 
} from './api.utils.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { add_sanity_crud_to_test_suite } from './api.crud.js';

/** @type {CustomerTypeUpsert[]} */
const items_upsert = [
  {
    email: 'a1@a.com', firstname: 'name 1', lastname: 'last 1',
  },
  {
    email: 'a2@a.com', firstname: 'name 2', lastname: 'last 2',
  },
  {
    email: 'a3@a.com', firstname: 'name 3', lastname: 'last 3',
  },
]

/**
 * 
 * @param {App} app 
 */
export const create = app => {

  /** @type {Test<CrudTestContext<CustomerType>>} */
  const s = suite(
    file_name(import.meta.url), 
    { 
      items: items_upsert, 
      app, 
      ops: app.api.customers,
      events: {
        get_event: 'customers/get',
        upsert_event: 'customers/upsert',
        remove_event: 'customers/remove',
      }
    }
  );

  s.before(
    async () => { 
      assert.ok(app.ready) 
      try {
        for(const p of items_upsert) {
          const get = await app.api.customers.getByEmail(p.email);
          if(get)
            await app.api.customers.remove(get.id);
        }
      } catch(e) {
        console.log(e)
        assert.unreachable('failed to remove items');
      }

    }
  );

  add_sanity_crud_to_test_suite(s);

  s('remove customer -> removes auth-user + events', async () => {
    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    const email = withRandom('tester') + '@example.com';

    await app.api.auth.signup({
      email,
      password: 'password'
    });

    const au = await app.api.auth.get_auth_user(email);

    // remove the customer
    const success = await app.api.customers.remove(email);

    assert.ok(success, 'remove customer failed');


    { // check `auth/remove` event
      const event = events['auth/remove'];
      assert.ok(event?.previous, '`auth/remove` event not found');
      assert.equal(
        event.previous.email, email, 
        'auth/remove email mismatch'
      );
    }

    { // check `auth/remove` event
      const event = events['customers/remove'];
      assert.ok(event?.previous, '`customers/remove` event not found');
      assert.equal(
        event.previous.email, email, 
        'auth/remove email mismatch'
      );
    }

    unsub();
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
