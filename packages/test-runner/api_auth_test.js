import 'dotenv/config';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import { App } from '@storecraft/core';
import esMain from './utils.esmain.js';
import { sleep } from './utils.js';


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
    const r = await app.api.auth.signup({
      email: admin_email,
      password: admin_password
    });
  
    const has_admin_role = r.access_token.claims?.roles?.includes('admin')
    const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
    assert.ok(ok, 'nope');
  });
  
  s('signin admin', async () => {
    const r = await app.api.auth.signin({
      email: admin_email,
      password: admin_password
    });
  
    const has_admin_role = r.access_token.claims?.roles?.includes('admin')
    const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
    assert.ok(ok, 'nope');
  });
  
  s('refresh admin', async () => {
  
    const u = await app.api.auth.signin({
      email: admin_email,
      password: admin_password
    });
    const r = await app.api.auth.refresh({
      refresh_token: u.refresh_token.token
    });
  
    const has_admin_role = r.access_token.claims?.roles?.includes('admin')
    const ok = r.access_token && r.refresh_token && r.user_id && has_admin_role; 
    assert.ok(ok, 'nope');
  });

  s('apikey create, validate, list and remove', async () => {
  
    const apikey_created = await app.api.auth.create_api_key();
    const isvalid = await app.api.auth.verify_api_key({
      apikey: apikey_created.apikey
    });
    const apikey_created_decoded_email = atob(apikey_created.apikey).split(':').at(0);

    assert.ok(isvalid, 'apikey is invalid');

    // now list only api keys
    {
      const apikeys = await app.api.auth.list_all_api_keys_info();
      let is_apikey_created_present = false;

      assert.ok(apikeys?.length, 'no api keys were found');

      for (const apikey of apikeys) {
        if(apikey.email === apikey_created_decoded_email) {
          is_apikey_created_present = true;
        }

        assert.ok(apikey.tags.includes('apikey'), 'invalid tag for api key');
      }

      assert.ok(is_apikey_created_present, 'created api key was not found !');

      // now find the `apikey_created` in the list

    }

    { 
      // now remove
      await app.api.auth.remove_auth_user(apikey_created_decoded_email);

      const apikeys = await app.api.auth.list_all_api_keys_info();

      assert.ok(
        apikeys.every(ak => ak.email!==apikey_created_decoded_email), 
        'apikey could not be removed'
      );

    }

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
