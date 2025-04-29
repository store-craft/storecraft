/**
 * @import { TagType, TagTypeUpsert
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
  let api;

  const s = suite(
    file_name(import.meta.url), 
    {}
  );

    // console.log({credentials});

  s.before(
    async () => { 
      await app.init();
      app.rest_controller.logger.active=false;
      assert.ok(app.ready);
    }
  );

  s.after(
    async () => { 
      app.rest_controller.logger.active=true;
    }
  );

  s('tags', async (ctx) => {
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

    const id = ID('tag')

    /** @type {TagTypeUpsert} */
    const item = {
      values: ['rock', 'pop'],
      handle: 'genre'
    }
    
    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      tags: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.tags.get(id);
                  assert.equal(proof, 'proof.tags.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.tags.get';
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
                  const proof = await sdk.tags.remove(id);
                  assert.equal(proof, 'proof.tags.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  // await sdk.tags.remove(id);
                  await assert_async_throws(
                    () => sdk.tags.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.tags.remove';
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
                  const proof = await sdk.tags.list(
                    /** @type {ApiQuery<TagType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.tags.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.tags.list';
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
                  const proof = await sdk.tags.count_query(
                    /** @type {ApiQuery<TagType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.tags.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.tags.count';
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
                    const proof = await sdk.tags.upsert(item);
                    assert.equal(proof, 'proof.tags.upsert');
                  }
                  { // non secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.tags.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.tags.upsert';
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