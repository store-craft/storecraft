/**
 * @import { events } from '../../pubsub/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { verify_api_auth_result } from './auth.utils.js';


export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

/**
 * 
 * @param {App} app 
 */
export const create = app => {
  const s = suite(
    file_name(import.meta.url), 
  );
  
  s.before(async () => { assert.ok(app.ready) });
  
  s('remove and signup admin', async () => {

    await app.api.auth.removeByEmail(admin_email);
    await app.api.customers.remove(admin_email);

    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    const auth_result = await app.api.auth.signup(
      {
        email: admin_email,
        password: admin_password
      }
    );

    // console.log({auth_result})

    { // check auth result
      const has_admin_role = auth_result.access_token.claims?.roles?.includes('admin')
      assert.ok(has_admin_role, 'no admin role');
      verify_api_auth_result(
        app, auth_result, admin_email
      );
    }

    { // check events
      { // check auth/signup
        const event = events['auth/signup'];
        assert.ok(event, 'event not found');
        assert.equal(
          event.email, admin_email, 
          'auth/signup email mismatch'
        );
      }
      { // test `auth/upsert` event
        const event = events['auth/upsert'];
        assert.ok(event, 'no auth/upsert event');
        assert.ok(
          event.email===auth_result.access_token.claims.email, 
          'auth/upsert emails not matching'
        );
      }
      { // check customers/upsert
        const event = events['customers/upsert'];
        assert.ok(event, 'event not found');
        assert.equal(
          event.current.email, admin_email, 
          'customers/upsert email mismatch'
        );
      }
    }
  
    unsub();
  });
  
  s('signin admin', async () => {

    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    const auth_result = await app.api.auth.signin(
      {
        email: admin_email,
        password: admin_password
      }
    );
  
    { // check auth result
      const has_admin_role = auth_result.access_token.claims?.roles?.includes('admin')
      assert.ok(has_admin_role, 'no admin role');
      verify_api_auth_result(
        app, auth_result, admin_email
      );
    }

    { // check auth/signin
      const event = events['auth/signin'];
      assert.ok(event, 'event not found');
      assert.equal(
        event.email, admin_email, 'auth/signin email mismatch'
      );
    }

    unsub();
  });
  
  s('refresh admin', async () => {
    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    const u = await app.api.auth.signin({
      email: admin_email,
      password: admin_password
    });
    const api_auth_result = await app.api.auth.refresh({
      refresh_token: u.refresh_token.token
    });
  
    verify_api_auth_result(
      app, api_auth_result, admin_email
    );

    { // check auth/refresh
      const event = events['auth/refresh'];
      assert.ok(event, 'event not found');
      verify_api_auth_result(
        app, event, admin_email
      );
    }

    unsub();
  });

  s('apikey create, validate, list and remove', async () => {
  
    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );
    
    const apikey_created = await app.api.auth.create_api_key();
    const isvalid = await app.api.auth.verify_api_key({
      apikey: apikey_created.apikey
    });
    
    assert.ok(isvalid, 'apikey is invalid');
    
    const apikey_created_decoded_email = atob(apikey_created.apikey).split(':').at(0);

    { // check `auth/apikey-created` and `auth/upsert` events after apikey creation

      { // check auth/apikey-created
        const event = events['auth/apikey-created'];
        assert.ok(event, 'event not found');
        assert.equal(
          event.email, apikey_created_decoded_email, 
          'auth/apikey-created email mismatch'
        );
      }
  
      { // check auth/upsert
        const event = events['auth/upsert'];
        assert.ok(event, 'event not found');
        assert.equal(
          event.email, apikey_created_decoded_email, 
          'auth/upsert email mismatch'
        );
      }
      
    }

    { // test list only api keys
      const apikeys = await app.api.auth.list_all_api_keys_info();
      let is_apikey_created_present = false;

      assert.ok(apikeys?.length, 'no api keys were found');

      for (const apikey of apikeys) {
        if(apikey.email === apikey_created_decoded_email) {
          is_apikey_created_present = true;
        }

        assert.ok(
          apikey.tags.includes('apikey'), 
          'invalid tag for api key'
        );
      }

      assert.ok(
        is_apikey_created_present, 
        'created api key was not found !'
      );

    }

    { // test auth remove
      await app.api.auth.remove_auth_user(apikey_created_decoded_email);

      const apikeys = await app.api.auth.list_all_api_keys_info();

      assert.ok(
        apikeys.every(ak => ak.email!==apikey_created_decoded_email), 
        'apikey could not be removed'
      );

      { // check auth/remove event
        const event = events['auth/remove'];
        assert.ok(event, 'event not found');
        assert.equal(
          event.email, apikey_created_decoded_email, 
          'auth/remove email mismatch'
        );
      }

      
    }
    
    unsub();
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
