/**
 * @import { CollectionType, CollectionTypeUpsert, CustomerType, CustomerTypeUpsert, OrderData, ProductType, TagType, TagTypeUpsert, TemplateType, TemplateTypeUpsert
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
import { assert_async_throws, withRandom } from '../api/utils.js';
import { api_query_to_searchparams, parse_query } from '../../api/utils.query.js';
import { ID } from '../../api/utils.func.js';

/**
 * @param {App} app `storecraft` app instance
 */
export const create = (app) => {
  const sdk = setup_sdk(app);
  let api;

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

    // console.log({credentials});

  s.before(
    async () => { 
      await app.init();
      api = app.api;
      // @ts-ignore
      // app.api = mock_proof_api;
    
      assert.ok(app.ready);
    }
  );

  s.after(
    async () => { 
      // @ts-ignore
      app.api = api;
    }
  );

  s('customers', async (ctx) => {
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

    const id = ID('col')

    /** @type {CustomerTypeUpsert} */
    const item = {
      email: 'test@a.com',
    }

    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      customers: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.customers.get(id),
                    'get is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.customers.get(id);
                  assert.equal(proof, 'proof.customers.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.customers.get';
              },
            },

            () => { // test customer can fetch his own resource
              const test_user = {
                email: withRandom() + '@example.com',
                password: 'non-admin',
              }

              return { // This test is for customer
                // to fetch it's own orders
                test: async () => {
                  { // secured customer. customer fetches it's own orders
                    await sdk.auth.signup(test_user.email, test_user.password);
                    const proof = await sdk.customers.get(
                      test_user.email
                    );
                    assert.equal(proof, 'proof.customers.get.customer-variant');
                  }
                },
                intercept_backend_api: async (handle_or_id) => {
                  assert.equal(handle_or_id, test_user.email);
                  return 'proof.customers.get.customer-variant';
                },
              }     
            }

          ]
        },        
                 

        remove: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.customers.remove(id);
                  assert.equal(proof, 'proof.customers.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.customers.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.customers.remove';
              },
            }
          ]
        },               
        

        list: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.customers.list(
                    /** @type {ApiQuery<CustomerType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.customers.list');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  assert_async_throws(
                    () => sdk.customers.list(
                      /** @type {ApiQuery<CustomerType>} */ (legit_query)
                    ),
                    'list is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.customers.list';
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
                  assert_async_throws(
                    () => sdk.customers.count_query(
                      /** @type {ApiQuery<CustomerType>} */ (legit_query)
                    ),
                    'count_query is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.customers.count_query(
                    /** @type {ApiQuery<CustomerType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.customers.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.customers.count';
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
                    const proof = await sdk.customers.upsert(item);
                    assert.equal(proof, 'proof.customers.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.customers.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.customers.upsert';
                },
              }
            },
            () => {
              const test_user = {
                email: withRandom() + '@example.com',
                password: 'non-admin',
              }
              /** @type {CustomerTypeUpsert} */
              const test_customer = {
                email: test_user.email,
              }

              return { // This test is for customer
                // to fetch it's own orders
                test: async () => {
                  { // secured customer. customer fetches it's own orders
                    await sdk.auth.signup(test_user.email, test_user.password);
                    const proof = await sdk.customers.upsert(
                      test_customer
                    );
                    assert.equal(proof, 'proof.customers.upsert.customer-variant');
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params.email, test_user.email);
                  return 'proof.customers.upsert.customer-variant';
                },
              }     
            }

          ]
        },  
        
        
        list_customer_orders: {
          __tests: [
            { 
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.customers.query_customer_orders(
                      id, 
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    ),
                    'list_customer_orders is not secured'
                  );
                }
                { // secured admin
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.customers.query_customer_orders(
                    id,
                    /** @type {ApiQuery<OrderData>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.customers.list_customer_orders');
                }
              },
              intercept_backend_api: async (id_or_handled, params) => {
                assert.equal(id_or_handled, id);
                assert.equal(params, legit_query);
                return 'proof.customers.list_customer_orders';
              },
            },
            () => { // test for customer
              // to fetch it's own orders
              const test_user = {
                email: withRandom() + '@example.com',
                password: 'non-admin',
              }
              return { // This test is for customer
                // to fetch it's own orders
                test: async () => {
                  { // secured customer. customer fetches it's own orders
                    await sdk.auth.signup(test_user.email, test_user.password);
                    const proof = await sdk.customers.query_customer_orders(
                      test_user.email,
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    );
                    assert.equal(proof, 'proof.customers.list_customer_orders.customer-variant');
                  }
                },
                intercept_backend_api: async (id_or_handled, params) => {
                  assert.equal(id_or_handled, test_user.email);
                  assert.equal(params, legit_query);
                  return 'proof.customers.list_customer_orders.customer-variant';
                },
              }            
            }
          ]
        },

        count_customer_orders: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.customers.count_customer_orders_query(
                      id, 
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    ),
                    'count_customer_orders_query is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.customers.count_customer_orders_query(
                    id,
                    /** @type {ApiQuery<OrderData>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.customers.count_customer_orders_query');
                }
              },
              intercept_backend_api: async (id_or_handled, params) => {
                assert.equal(id_or_handled, id);
                assert.equal(params, legit_query);
                return 'proof.customers.count_customer_orders_query';
              },
            },
            () => {
              const test_user = {
                email: withRandom() + '@example.com',
                password: 'non-admin',
              }

              return { // This test is for customer
                // to fetch it's own orders
                test: async () => {
                  { // secured customer. customer fetches it's own orders
                    await sdk.auth.signup(
                      test_user.email,
                      test_user.password
                    );
                    const proof = await sdk.customers.count_customer_orders_query(
                      test_user.email,
                      /** @type {ApiQuery<OrderData>} */ (legit_query)
                    );
                    assert.equal(proof, 'proof.customers.count_customer_orders_query.customer-variant');
                  }
                },
                intercept_backend_api: async (id_or_handled, params) => {
                  assert.equal(id_or_handled, test_user.email);
                  assert.equal(params, legit_query);
                  return 'proof.customers.count_customer_orders_query.customer-variant';
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