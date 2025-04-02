/**
 * @import { events } from '../../pubsub/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { verify_api_auth_result } from './auth.utils.js';
import { jwt } from '../../crypto/public.js';
import { CONFIRM_EMAIL_TOKEN, FORGOT_PASSWORD_IDENTITY_TOKEN } from '../../api/con.auth.logic.js';
import { assert_partial_v2, withRandom } from './utils.js';


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
  
  s('signup admin + events', async () => {

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
    { // assert auth-user was created
      const auth_user = await app.api.auth.get_auth_user(admin_email);
      assert.ok(auth_user, 'auth user not found');
      assert.equal(
        auth_user.email, admin_email, 
        'auth user email mismatch'
      );
    }

    { // assert customer was created
      const customer = await app.api.customers.get(admin_email);
      assert.ok(customer, 'customer not found');
      assert.equal(
        customer.email, admin_email, 
        'customer email mismatch'
      );
    }

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

  s('remove auth-user -> removes customer', async () => {
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

    const api_auth_result = await app.api.auth.signup({
      email,
      password: 'password'
    });

    { // assert customer was created
      const customer = await app.api.customers.get(email);
      assert.ok(customer, 'customer not found');
      assert.equal(
        customer.email, email, 'customer email mismatch'
      );
    }

    // remove the user
    const success = await app.api.auth.remove_auth_user(
      api_auth_result.user_id
    );
  
    assert.ok(success, 'remove auth user failed');

    { // assert auth-user was removed
      const au = await app.api.auth.get_auth_user(email);
      assert.ok(!au, 'auth user not removed');
    }

    { // assert customer was removed
      const au = await app.api.customers.get(email);
      assert.ok(!au, 'customer not removed');
    }

    // console.log({events})

    { // check `auth/remove` event
      const event = events['auth/remove'];
      assert.ok(event?.previous, 'event not found');
      assert.equal(
        event.previous.email, email, 
        'auth/remove email mismatch'
      );
    }

    { // check `auth/remove` event
      const event = events['customers/remove'];
      assert.ok(event?.previous, 'event not found');
      assert.equal(
        event.previous.email, email, 
        'auth/remove email mismatch'
      );
    }

    unsub();
  });

  s('change password admin', async () => {

    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    const auth_result = await app.api.auth.change_password(
      {
        user_id_or_email: admin_email,
        current_password: admin_password,
        new_password: 'new_password',
        confirm_new_password: 'new_password'
      }
    );
  
    { // check auth result
      const has_admin_role = auth_result.access_token.claims?.roles?.includes('admin')
      assert.ok(has_admin_role, 'no admin role');
      verify_api_auth_result(
        app, auth_result, admin_email
      );
    }

    { // try signin with old password
      try {
        await app.api.auth.signin({
          email: admin_email,
          password: admin_password
        });
        assert.unreachable('old password should not work');
      } catch (e) {
      }
    }

    { // try signin with new password
      const api_auth_result = await app.api.auth.signin({
        email: admin_email,
        password: 'new_password'
      });
      verify_api_auth_result(
        app, api_auth_result, admin_email
      );
    }

    { // check auth/change-password event
      const event = events['auth/change-password'];
      assert.ok(event, 'event `auth/change-password` not found');
      assert.equal(
        event.email, admin_email, '`auth/change-password` email mismatch'
      );
    }

    unsub();
  });

  s('forgot password request and confirm', async () => {

    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    await app.api.auth.forgot_password_request(
      admin_email,
    );

    const event_forgot_password_token_generated = events['auth/forgot-password-token-generated'];

    // console.log({events})
  
    { // check `auth/forgot-password-token-generated` event
      assert.ok(
        event_forgot_password_token_generated, 
        'event `auth/forgot-password-token-generated` not found'
      );
      assert.equal(
        event_forgot_password_token_generated.auth_user.email, admin_email, 
        '`auth/forgot-password-token-generated` email mismatch'
      );
      // now verify the token
      const verification_result = await jwt.verify(
        app.config.auth_secret_forgot_password_token, 
        event_forgot_password_token_generated.token, 
        true
      );
      assert.ok(
        verification_result.verified, 
        'forgot password token not verified'
      );
      assert.ok(
        verification_result.claims?.sub === admin_email, 
        'forgot password claim failed \
        `verification_result.claims?.sub === admin_email`'
      );
      assert.ok(
        verification_result.claims?.aud === FORGOT_PASSWORD_IDENTITY_TOKEN, 
        'forgot password claim failed \
        `verification_result.claims?.aud === FORGOT_PASSWORD_IDENTITY_TOKEN`'
      );
    }

    // now confirm the request
    const confirm_result = await app.api.auth.forgot_password_request_confirm(
      event_forgot_password_token_generated.token
    )

    { // test the confirmation result
      assert.equal(
        confirm_result.email,
        admin_email,
        'confirm result email mismatch'
      )
  
      assert.ok(
        confirm_result.password,
        'confirm result password missing'
      )
    }

    { // check `auth/forgot-password-token-confirm` event
      const event = events['auth/forgot-password-token-confirmed'];
      // console.log({event})
      assert.ok(
        event, 
        'event `auth/forgot-password-token-confirmed` not found'
      );
      assert.equal(
        event.email, 
        confirm_result.email, 
        '`auth/forgot-password-token-confirmed` email !== confirm result'
      );
    }

    { // try signin with new password
      const api_auth_result = await app.api.auth.signin({
        email: admin_email,
        password: confirm_result.password
      });
      verify_api_auth_result(
        app, api_auth_result, admin_email
      );
    }

    unsub();
  });

  s('confirm email and confirm', async () => {

    /** @type {Partial<events>} */
    const events  = {}
    // record all events for later check
    const unsub = app.pubsub.on(
      '*',
      (v) => {
        events[v.event] = v.payload;
      }
    );

    // first let's signup a new user
    const email = 'confirm-email-tester@example.com';
    await app.api.auth.removeByEmail(email);
    const auth_user = await app.api.auth.signup(
      {
        email,
        password: 'password'
      }
    );

    const event_confirm_email_token_generated = events['auth/confirm-email-token-generated'];

    { // check `auth/confirm-email-token-generated` event
      assert.ok(
        event_confirm_email_token_generated, 
        'event `auth/confirm-email-token-generated` not found'
      );
      assert.equal(
        event_confirm_email_token_generated.auth_user.email, 
        email, 
        '`auth/confirm-email-token-generated` email mismatch'
      );
      // now verify the token
      const verification_result = await jwt.verify(
        app.config.auth_secret_confirm_email_token, 
        event_confirm_email_token_generated.token, 
        true
      );
      assert.ok(
        verification_result.verified, 
        'forgot password token not verified'
      );
      assert.ok(
        verification_result.claims?.sub === auth_user.user_id, 
        'forgot password claim failed \
        `verification_result.claims?.sub === auth_user.user_id`'
      );
      assert.ok(
        verification_result.claims?.aud === CONFIRM_EMAIL_TOKEN, 
        'forgot password claim failed \
        `verification_result.claims?.aud === CONFIRM_EMAIL_TOKEN`'
      );
    }

    // now confirm the token
    await app.api.auth.confirm_email(
      event_confirm_email_token_generated.token
    )

    // console.log({events})

    { // check `auth/confirm-email-token-confirmed` event
      const event = events['auth/confirm-email-token-confirmed'];
      assert.ok(
        event, 
        'event `auth/confirm-email-token-confirmed` not found'
      );
      assert.ok(
        event.confirmed_mail, 
        'auth user not confirmed'
      );
      assert.equal(
        event.email, 
        email, 
        '`auth/confirm-email-token-confirmed` email !== user email'
      );
    }

    unsub();
  });

  s('apikeys create, validate, list and remove', async () => {
  
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
          event.previous.email, apikey_created_decoded_email, 
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
