/**
 * @import { 
 *  CollectionType, CollectionTypeUpsert, ProductType, 
 *  TagType, TagTypeUpsert, TemplateType, TemplateTypeUpsert
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
import { api_query_to_searchparams, parse_query } from '../../api/utils.query.js';
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

  s('collections', async (ctx) => {
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

    /** @type {CollectionTypeUpsert} */
    const item = {
      title: 'test',
      active: true
    }

    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      collections: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.collections.get(id);
                  assert.equal(proof, 'proof.collections.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.collections.get';
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
                  const proof = await sdk.collections.remove(id);
                  assert.equal(proof, 'proof.collections.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.collections.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.collections.remove';
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
                  const proof = await sdk.collections.list(
                    /** @type {ApiQuery<CollectionType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.collections.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.collections.list';
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
                  const proof = await sdk.collections.count_query(
                    /** @type {ApiQuery<CollectionType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.collections.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.collections.count';
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
                    const proof = await sdk.collections.upsert(item);
                    assert.equal(proof, 'proof.collections.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.collections.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.collections.upsert';
                },
              }
            }

          ]
        },  
        
        
        count_collection_products_query: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.collections.count_collection_products_query(
                    id,
                    /** @type {ApiQuery<ProductType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.collections.count_collection_products_query');
                }
              },
              intercept_backend_api: async (id_or_handled, params) => {
                assert.equal(id_or_handled, id);
                assert.equal(params, legit_query);
                return 'proof.collections.count_collection_products_query';
              },
            }
          ]
        },              
        
        list_collection_products: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.collections.query_collection_products(
                    id,
                    /** @type {ApiQuery<ProductType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.collections.list_collection_products');
                }
              },
              intercept_backend_api: async (id_or_handled, params) => {
                assert.equal(id_or_handled, id);
                assert.equal(params, legit_query);
                return 'proof.collections.list_collection_products';
              },
            }
          ]
        },

        list_used_products_tags: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.collections.list_used_products_tags(
                    id,
                  );
                  assert.equal(proof, 'proof.collections.list_used_products_tags');
                }
              },
              intercept_backend_api: async (id_or_handled) => {
                assert.equal(id_or_handled, id);
                return 'proof.collections.list_used_products_tags';
              },
            }
          ]
        },

        export_collection: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.collections.publish(id),
                    'export_collection is not secured'
                  );
                }
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.collections.publish(
                    id,
                  );
                  assert.equal(proof, 'proof.collections.export_collection');
                }
              },
              intercept_backend_api: async (id_or_handled) => {
                assert.equal(id_or_handled, id);
                return 'proof.collections.export_collection';
              },
            }
          ]
        }
        

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