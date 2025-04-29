/**
 * @import { OrderData, OrderDataUpsert,
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { ApiQuery } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, assert_async_throws } from '../api/api.utils.js';
import { 
  App, CheckoutStatusEnum, FulfillOptionsEnum, 
  PaymentOptionsEnum 
} from '../../index.js';
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
      assert.ok(app.ready);
      app.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.rest_controller.logger.active=true;
    }
  );

  s('orders', async (ctx) => {
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

    const id = ID('order')

    /** @type {OrderDataUpsert} */
    const item = {
      line_items: [],
      pricing: {
        quantity_discounted: 0,
        quantity_total: 0,
        total: 0,
        subtotal: 0,
        subtotal_discount: 0,
        subtotal_undiscounted: 0
      },
      shipping_method: {
        handle: 'test',
        id: 'test',
        price: 0,
        title: 'test',
      },
      status: {
        checkout: CheckoutStatusEnum.unknown,
        payment: PaymentOptionsEnum.unpaid,
        fulfillment: FulfillOptionsEnum.draft
      }
    }
    
    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      orders: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // order is never secured because it is cryptographic id
                  const proof = await sdk.orders.get(id);
                  assert.equal(proof, 'proof.orders.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.orders.get';
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
                  const proof = await sdk.orders.remove(id);
                  assert.equal(proof, 'proof.orders.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.orders.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.orders.remove';
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
                    () => sdk.orders.list(
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    ),
                    'list is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.orders.list(
                    /** @type {ApiQuery<OrderData>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.orders.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.orders.list';
              },
            }
          ]
        },       
        
        list_my_orders: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.orders.list(
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    ),
                    'list_my_orders is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.orders.list_my_orders(
                    /** @type {ApiQuery<OrderData>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.orders.list_my_orders');
                }
              },
              intercept_backend_api: async (id_or_email, query) => {
                assert.equal(id_or_email, user.email);
                assert.equal(query, legit_query);
                return 'proof.orders.list_my_orders';
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
                    () => sdk.orders.count_query(
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    ),
                    'count is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.orders.count_query(
                    /** @type {ApiQuery<OrderData>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.orders.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.orders.count';
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
                    const proof = await sdk.orders.upsert(item);
                    assert.equal(proof, 'proof.orders.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.orders.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.orders.upsert';
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