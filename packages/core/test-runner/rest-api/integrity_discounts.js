/**
 * @import { 
 *  DiscountType, DiscountTypeUpsert, ProductType, 
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { ApiQuery } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.js';
import { 
  App, DiscountApplicationEnum, 
} from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
import { assert_async_throws } from '../api/api.utils.js';
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

  s('discounts', async (ctx) => {
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

    const id = ID('dis')

    /** @type {DiscountTypeUpsert} */
    const item = {
      title: 'test',
      active: true,
      application: DiscountApplicationEnum.Auto,
      priority: 0,
      info: {
        details: {
          type: 'order',
          extra: {
            fixed: 0,
            percent: 0
          }
        },
        filters: [
          {
            op: 'p-in-collections',
            value: [
              {
                handle: 'd'
              }
            ]
          }
        ]
      }
    }

    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      discounts: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.discounts.get(id);
                  assert.equal(proof, 'proof.discounts.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.discounts.get';
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
                  const proof = await sdk.discounts.remove(id);
                  assert.equal(proof, 'proof.discounts.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.discounts.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.discounts.remove';
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
                  const proof = await sdk.discounts.list(
                    /** @type {ApiQuery<DiscountType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.discounts.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.discounts.list';
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
                  const proof = await sdk.discounts.count_query(
                    /** @type {ApiQuery<DiscountType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.discounts.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.discounts.count';
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
                    const proof = await sdk.discounts.upsert(item);
                    assert.equal(proof, 'proof.discounts.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.discounts.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.discounts.upsert';
                },
              }
            }

          ]
        },  
        
        
        count_discount_products_query: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.discounts.count_discount_products_query(
                    id,
                    /** @type {ApiQuery<ProductType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.discounts.count_discount_products_query');
                }
              },
              intercept_backend_api: async (id_or_handled, params) => {
                assert.equal(id_or_handled, id);
                assert.equal(params, legit_query);
                return 'proof.discounts.count_discount_products_query';
              },
            }
          ]
        },              
        
        list_discount_products: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.discounts.query_discount_products(
                    id,
                    /** @type {ApiQuery<ProductType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.discounts.list_discount_products');
                }
              },
              intercept_backend_api: async (id_or_handled, params) => {
                assert.equal(id_or_handled, id);
                assert.equal(params, legit_query);
                return 'proof.discounts.list_discount_products';
              },
            }
          ]
        },

        list_used_discount_products_tags: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.discounts.list_used_discount_products_tags(
                    id,
                  );
                  assert.equal(proof, 'proof.discounts.list_used_discount_products_tags');
                }
              },
              intercept_backend_api: async (id_or_handled) => {
                assert.equal(id_or_handled, id);
                return 'proof.discounts.list_used_discount_products_tags';
              },
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