/**
 * @import { 
 *  NotificationType, NotificationTypeUpsert
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { ApiQuery } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, assert_async_throws } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
import { 
  api_query_to_searchparams, parse_query 
} from '../../api/query.js';
import { ID } from '../../api/utils.func.js';

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
      assert.ok(app.isready);
      app.__show_me_everything.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.__show_me_everything.rest_controller.logger.active=true;
    }
  );

  s('notifications', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    const legit_query = parse_query(
      api_query_to_searchparams({
        limit: 10,
        order: 'desc',
        vql: 'active:true'
      })
    );

    const id = ID('not')

    /** @type {NotificationTypeUpsert} */
    const item = {
      message: 'test',
    }
    
    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      notifications: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // non-secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.notifications.get(id),
                    'get is not secured'
                  )
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.notifications.get(id);
                  assert.equal(proof, 'proof.notifications.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.notifications.get';
              },
            }
          ]
        },        
                 

        remove: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.notifications.remove(id);
                  assert.equal(proof, 'proof.notifications.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.notifications.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.notifications.remove';
              },
            }
          ]
        },               
        

        list: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.notifications.list(
                      /** @type {ApiQuery<NotificationType>} */ (legit_query)
                    ),
                    'list is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.notifications.list(
                    /** @type {ApiQuery<NotificationType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.notifications.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.notifications.list';
              },
            }
          ]
        },        
        
        count: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.notifications.count_query(
                      /** @type {ApiQuery<NotificationType>} */ (legit_query)
                    ),
                    'count is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.notifications.count_query(
                    /** @type {ApiQuery<NotificationType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.notifications.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.notifications.count';
              },
            }
          ]
        },       
                
        upsert: {
          __tests: [
            () => {
              return { // asert secured endpoint
                test: async () => {
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.notifications.upsert(item);
                    assert.equal(proof, 'proof.notifications.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.notifications.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.notifications.upsert';
                },
              }
            }

          ]
        },             

      },

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