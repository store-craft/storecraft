/**
 * @import { ChatType, ChatTypeUpsert } from '../../api/types.api.js'
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

  s('chats', async (ctx) => {
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
        vql: 'active=true'
      })
    );

    const id = ID('chat')

    /** @type {ChatTypeUpsert} */
    const item = {
      customer_email: 'a@a.com',
      customer_id: 'cus_123456789',
      extra: { a1: 1 },
    }
    
    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      chats: {

        get: {
          __tests: [
            { 
              test: async () => {
                { // secured
                  sdk.config.auth = undefined;
                  const proof = await sdk.chats.get(id);
                  assert.equal(proof, 'proof.chats.get');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.chats.get';
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
                  const proof = await sdk.chats.remove(id);
                  assert.equal(proof, 'proof.chats.remove');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.chats.remove(id),
                    'remove is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, id);
                return 'proof.chats.remove';
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
                  const proof = await sdk.chats.list(
                    /** @type {ApiQuery<ChatType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.chats.list');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.chats.list';
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
                  const proof = await sdk.chats.count_query(
                    /** @type {ApiQuery<ChatType>} */ (legit_query)
                  );
                  assert.equal(proof, 'proof.chats.count');
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params, legit_query);
                return 'proof.chats.count';
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
                    const proof = await sdk.chats.upsert(item);
                    assert.equal(proof, 'proof.chats.upsert');
                  }
                  { // non secured
                    await sdk.auth.signout();
                    await assert_async_throws(
                      () => sdk.chats.upsert(item),
                      'upsert is not secured'
                    );
                  }
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params, item);
                  return 'proof.chats.upsert';
                },
              }
            }

          ]
        },    
        
        download: {
          __tests: [
            () => {
              const id = ID('chat');
              const presigned_result_expected = /** @type {{type: "presigned", presigned: import('../../storage/types.storage.js').StorageSignedOperation}} */({
                type: 'presigned',
                presigned: {
                  method: 'GET',
                  url: 'https://example.com',
                  headers: {
                    'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
                    'x-amz-date': '20231001T000000Z',
                    'Authorization': 'AWS4-HMAC-SHA256 Credential=AKIAEXAMPLE/20231001/us-east-1/s3/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=EXAMPLE'
                  }
                }
              })

              return { // asert secured endpoint
                test: async () => {
                  { // secured

                    await sdk.auth.signout();
                    const presigned_result_actual = await sdk.chats.download(id, false);

                    assert.equal(presigned_result_actual, presigned_result_expected.presigned);
                  }
                },
                intercept_backend_api: async (chat_id, prefers_presigned_urls) => {
                  assert.equal(chat_id, id);
                  assert.equal(prefers_presigned_urls, false);

                  return presigned_result_expected;
                },
              }
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
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();