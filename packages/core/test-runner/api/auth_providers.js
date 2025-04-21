/**
 * @import { events } from '../../pubsub/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import { App } from '../../index.js';
import esMain from './utils.esmain.js';
import { GoogleAuth } from '../../auth/providers/google/index.js';
import { GithubAuth } from '../../auth/providers/github/index.js';
import { FacebookAuth } from '../../auth/providers/facebook/index.js';
import { XAuth } from '../../auth/providers/x/index.js';
import { DummyAuth } from '../../auth/providers/dummy/index.js';
import { verify_api_auth_result } from './auth.utils.js';

/**
 * 
 * @param {App} app 
 */
export const create = app => {
  const s = suite(
    file_name(import.meta.url), 
  );

  const app2 = app.withAuthProviders(
    {
      google: new GoogleAuth(),
      github: new GithubAuth(),
      facebook: new FacebookAuth(),
      x: new XAuth(),
      dummy: new DummyAuth()
    }
  );
  
  s.before(
    async () => { 
      await app2.init();
      assert.ok(app2.ready) 
    }
  );
  
  s('list providers integrity', async () => {

    const list = await app2.api.auth.identity_providers_list();
    
    for(const handle of Object.keys(app2.auth_providers)) {

      const provider_in_list = list.find(a => a.provider===handle)
      assert.ok(
        provider_in_list, 
        `provider ${handle} did not return in list`
      );
      assert.equal(
        provider_in_list.name, app2.auth_providers[handle].name, 
        'name doesn\'t match'
      );
      assert.equal(
        provider_in_list.description, app2.auth_providers[handle].description, 
        'description doesn\'t match'
      );
      assert.equal(
        provider_in_list.logo_url, app2.auth_providers[handle].logo_url, 
        'logo_url doesn\'t match'
      );
    }

  });

  s(
    'test (auth/signup, auth/signin, auth/upsert, customers/upsert) events for auth provider', 
    async () => {

      /** @type {Partial<events>} */
      const events  = {}
      // record all events for later check
      const unsub = app.pubsub.on(
        '*',
        (v) => {
          events[v.event] = v.payload;
        }
      );

      // reset the codes to users
      app2.auth_providers.dummy.codes_to_users = {}
      const r = await app2.api.auth.identity_provider_create_auth_uri(
        {
          provider: 'dummy',
          redirect_uri: 'https://example.com/auth/google/callback',
        }
      );
      
      // suppose we redirected and got the code
      const authorization_response = {
        code: String(Date.now()),
      }

      assert.ok(r.provider==='dummy', 'provider not set');

      { // now let's sign a first time user
        const api_auth_result = await app2.api.auth.identity_provider_sign_with(
          {
            provider: 'dummy', 
            authorization_response,
            redirect_uri: 'https://example.com/auth/dummy/callback',
          }
        );

        // sanity
        verify_api_auth_result(
          app, api_auth_result
        );
  
        // console.log({api_auth_result});
        // console.log({events});

        { // test `auth/signup` event
          const event = events['auth/signup'];
          assert.ok(event, 'no signup event');
          assert.ok(
            event.email===api_auth_result.access_token.claims.email, 
            'emails not matching'
          );
        }
              
        { // test `auth/upsert` event
          const event = events['auth/upsert'];
          assert.ok(event, 'no auth/upsert event');
          assert.ok(
            event.email===api_auth_result.access_token.claims.email, 
            'emails not matching'
          );
        }

        { // test `customers/upsert` event
          const event = events['customers/upsert'];
          assert.ok(event, 'no customers/upsert event');
          assert.ok(
            event.current.email===api_auth_result.access_token.claims.email, 
            'emails not matching'
          );
        }
      }

      { // now let's sign a second time user, this should trigger a signin
        const api_auth_result = await app2.api.auth.identity_provider_sign_with(
          {
            provider: 'dummy', 
            authorization_response,
            redirect_uri: 'https://example.com/auth/dummy/callback',
          }
        );

        // sanity
        verify_api_auth_result(
          app, api_auth_result
        );

        // console.log({api_auth_result});
        // console.log({events: JSON.stringify(events, null, 2)});

        { // test `auth/signin` event
          const event = events['auth/signin'];
          assert.ok(event, 'no auth/signin event');
          assert.ok(
            event.email===api_auth_result.access_token.claims.email, 
            'emails not matching'
          );
        }
      }

      unsub();
    }
  );
  
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
