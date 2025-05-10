/**
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, assert_async_throws } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
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

    // console.log({credentials});

  s.before(
    async () => { 
      await app.init();
      assert.ok(app.isready);
      app.__show_me_everything.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.__show_me_everything.rest_controller.logger.active=true;
    }
  );

  s('statistics', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }


    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      statistics: {

        compute_statistics: {
          __tests: [
            () => {

              const from_day =  '2023-01-01';
              const to_day = '2023-01-31';

              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.statistics.orders(from_day, to_day),
                      'sendMail is not secured'
                    )
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.statistics.orders(from_day, to_day);
                    assert.equal(proof, 'proof.statistics.compute_statistics');
                  }
                },
                intercept_backend_api: async ($from_day, $to_day) => {
                  assert.equal(new Date($from_day), new Date(from_day));
                  assert.equal(new Date($to_day), new Date(to_day));
                  return 'proof.statistics.compute_statistics';
                },
              }
            }
          ]
        },        
                 
      }

    }

    await test_setup(app, setup);

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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();