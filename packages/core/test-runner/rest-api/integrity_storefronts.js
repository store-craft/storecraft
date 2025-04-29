/**
 * @import { StorefrontType, StorefrontTypeUpsert
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

    // console.log({credentials});

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

  s('storefronts', async (ctx) => {
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

    const id = ID('sf')

    /** @type {StorefrontTypeUpsert} */
    const item = {
      active: true,
      title: 'test',
    }
    
    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      storefronts: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.storefronts.get(id);
                  assert.equal(proof, 'proof.storefronts.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.storefronts.get';
              },
            }
          ]
        },     
        
        
        get_default_auto_generated_storefront: {
          __tests: [
            { 
              test: async () => {
                { // secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.storefronts.get_default_auto_generated_storefront();
                  assert.equal(
                    proof, 
                    'proof.storefronts.get_default_auto_generated_storefront'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                return 'proof.storefronts.get_default_auto_generated_storefront';
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
                  const proof = await sdk.storefronts.remove(id);
                  assert.equal(proof, 'proof.storefronts.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.storefronts.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.storefronts.remove';
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
                  const proof = await sdk.storefronts.list(
                    /** @type {ApiQuery<StorefrontType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.storefronts.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.storefronts.list';
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
                  const proof = await sdk.storefronts.count_query(
                    /** @type {ApiQuery<StorefrontType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.storefronts.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.storefronts.count';
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
                    const proof = await sdk.storefronts.upsert(item);
                    assert.equal(proof, 'proof.storefronts.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.storefronts.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.storefronts.upsert';
                },
              }
            }

          ]
        },    
        
        export_storefront: {
          __tests: [
            () => {
              return { // asert secured endpoint
                test: async () => {
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    const proof = await sdk.storefronts.publish(id);
                    assert.equal(proof, 'proof.storefronts.export_storefront');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.storefronts.publish(id),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (_) => {
                  return 'proof.storefronts.export_storefront';
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