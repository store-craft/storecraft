/**
 * @import { TagType, TagTypeUpsert
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { ApiQuery } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.crud.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
import { assert_async_throws } from '../api/utils.js';
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
      assert.ok(app.ready);
      app.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.rest_controller.logger.active=true;
    }
  );

  s('payment-gateways', async (ctx) => {
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

    // for mockup dummy payments gateway
    const handle = 'dummy';
    const order_id = ID('order');

    /** @type {TagTypeUpsert} */
    const item = {
      values: ['rock', 'pop'],
      handle: 'genre'
    }
    
    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      payments: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // non-secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.payments.get(handle),
                    'get is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.payments.get(handle);
                  assert.equal(proof, 'proof.payments.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, handle);
                return 'proof.payments.get';
              },
            }
          ]
        },        

        list_all: {
          __tests: [
            { 
              test: async () => {
                { // non-secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.payments.list(),
                    'list_all is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.payments.list();
                  assert.equal(proof, 'proof.payments.list_all');
                }
              },
              intercept_backend_api: async (_) => {
                return 'proof.payments.list_all';
              },
            }
          ]
        },        
                       

        buy_ui: {
          __tests: [
            { // assert secured endpoint
              test: async () => {
                { // non-secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.payments.getBuyUI(order_id);
                  assert.equal(proof, 'proof.payments.buy_ui');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, order_id);
                return 'proof.payments.buy_ui';
              },
            }
          ]
        },               
        

        invoke_action: {
          __tests: [
            () => {
              const action_handle = 'dummy_action';
              return { // asert secured endpoint
                test: async () => {
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.payments.invokeAction(
                        action_handle, order_id
                      ),
                      'invokeAction is not secured'
                    );
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.payments.invokeAction(
                      action_handle, order_id
                    );
                    assert.equal(proof, 'proof.payments.invoke_action');
                  }
                },
                intercept_backend_api: async ($order_id, $action) => {
                  assert.equal($action, action_handle);
                  assert.equal($order_id, order_id);
                  return 'proof.payments.invoke_action';
                },
              }
            }
          ]
        },        


        status_of_order: {
          __tests: [
            () => {
              return { // asert secured endpoint
                test: async () => {
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.payments.paymentStatusOfOrder(
                        order_id
                      ),
                      'status_of_order is not secured'
                    );
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.payments.paymentStatusOfOrder(
                      order_id
                    );
                    assert.equal(proof, 'proof.payments.status_of_order');
                  }
                },
                intercept_backend_api: async ($order_id) => {
                  assert.equal($order_id, order_id);
                  return 'proof.payments.status_of_order';
                },
              }
            }
          ]
        },        
        

        webhook: {
          __tests: [
            () => {
              const webhook_body = {
                time: Date.now(),
              }

              let proof;

              return { // asert secured endpoint
                test: async () => {
                  { // non-secured
                    await sdk.auth.signin(user.email, user.password);
                    // webhook doesn't return anything
                    await sdk.payments.webhook(
                      handle, webhook_body
                    );
                    assert.equal(
                      proof, 
                      'proof.payments.webhook', 
                      'payments.webhook didnt invoke intercept_backend_api'
                    );
                  }
                },
                intercept_backend_api: async ($handle, request, response) => {
                  assert.ok(request);
                  assert.ok(response);

                  const $body = request.parsedBody;

                  assert.equal($handle, handle);
                  assert.equal($body, webhook_body);

                  // we can't use the proof system bacause webhook 
                  // doesn't return anything
                  proof = 'proof.payments.webhook';
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
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();