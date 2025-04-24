/**
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { admin_email } from '../api/auth.js';

/**
 * @param {App} app `storecraft` app instance
 */
export const create = (app) => {
  const sdk = setup_sdk(app);
  const s = suite(
    file_name(import.meta.url), 
    {}
  );

  s.before(
    async () => { 
      await app.init();
      assert.ok(app.ready);
      app.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.rest_controller.logger.active=true;
    }
  );

  s('/api/dashboard endpoint', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    const response = await app.rest_controller.handler(
      new Request(
        'https://localhost/api/dashboard',
        {
          method: 'GET',
        }
      )
    );

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('Content-Type'), 
      'text/html',
      'did not get HTML response'
    );

    const text = await response.text();
    assert.ok(
      text.includes('storecraft'),
      'did not get HTML response'
    );

  });  

  s('/api/dashboard/{version} (version) endpoint', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    const version = '1.0.20'
    const response = await app.rest_controller.handler(
      new Request(
        'https://localhost/api/dashboard/' + version,
        {
          method: 'GET',
        }
      )
    );

    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('Content-Type'), 
      'text/html',
      'did not get HTML response'
    );

    const text = await response.text();
    assert.ok(
      text.includes('storecraft'),
      'did not get HTML response'
    );
    assert.ok(
      text.includes(version),
      'did not get the correct version for HTML response'
    );

  });  


  s('/api/reference/settings (non-secured) endpoint', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    const response = await app.rest_controller.handler(
      new Request(
        'https://localhost/api/reference/settings',
        {
          method: 'GET',
        }
      )
    );

    assert.not(
      response.ok, '/api/reference/settings is not secured'
    );

  });    

  s('/api/reference/settings (admin secured) endpoint', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    const auth_result = await app.api.auth.signin(
      user
    );

    const response = await app.rest_controller.handler(
      new Request(
        'https://localhost/api/reference/settings',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth_result.access_token.token}`
          }
        }
      )
    );

    assert.ok(
      response.ok, '/api/reference/settings'
    );

    const actual_config = await response.json();
    const expected_config = {
      ...app.config,
    }

    assert.equal(
      response.headers.get('Content-Type'), 
      'application/json',
      'did not get JSON response'
    );

    // cleanup undefined properties
    for (const key in actual_config) {
      if (actual_config[key] === undefined) {
        delete actual_config[key];
      }
    }
    for (const key in expected_config) {
      if (expected_config[key] === undefined) {
        delete expected_config[key];
      }
    }

    assert.equal(
      actual_config,
      expected_config,
      'config is not matching'
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
  }
})();