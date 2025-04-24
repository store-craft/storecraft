/**
 * @import { 
 *  AuthUserType, OAuthProviderCreateURIParams, 
 *  SignWithOAuthProviderParams 
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { ApiQuery } from '../../api/types.public.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
import { assert_async_throws } from '../api/api.utils.js';
import { 
  api_query_to_searchparams, parse_query 
} from '../../api/query.js';

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

  s('auth', async (ctx) => {
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
        vql_as_string: 'active:true'
      })
    );

    const aaaa = await sdk.auth.signin(
      user.email, user.password
    );

    // console.log({aaaa})

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      auth: {
        signin: {
          __tests: [{
            test: async () => {
              const result = await sdk.auth.signin(
                user.email, user.password
              );
              assert.equal(result, 'proof.auth.signin');
            },
            intercept_backend_api: async (auth, v) => {
              assert.equal(auth, {email: user.email, password: user.password});
              return 'proof.auth.signin';
            },
          }]
        },

        signup: {
          __tests: [{
            test: async () => {
              const result = await sdk.auth.signup(
                user.email, user.password, 
                user.firstname, user.lastname
              );

              assert.equal(result, 'proof.auth.signup');
            },
            intercept_backend_api: async (body) => {
              assert.equal(body, user);
              return 'proof.auth.signup';
            },
          }]
        },


        change_password: {
          __tests: [
            () => {
              const payload = {
                user_id_or_email: user.email,
                current_password: user.password,
                new_password: 'newpassword',
                confirm_new_password: 'newpassword',
              }

              return {
                test: async function() {
                  sdk.config.auth = undefined;
                  const result = await sdk.auth.changePassword(
                    payload
                  );
    
                  assert.equal(result, 'proof.auth.change_password');
                },
                intercept_backend_api: async function(body) {
                  assert.equal(body, payload);
                  return 'proof.auth.change_password';
                },

              }
            }
          ]
        },

        create_api_key: {
          __tests: [
            {
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const result = await sdk.auth.create_api_key();
                  assert.equal(result, 'proof.auth.create_api_key');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.auth.create_api_key(),
                    'create_api_key not secured'
                  );
                }
              },

              intercept_backend_api: async () => {
                return 'proof.auth.create_api_key';
              },
            }
          ]
        },


        get_auth_user: {
          __tests: [
            {
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const result = await sdk.auth.get_auth_user(user.email);
                  assert.equal(result, 'proof.auth.get_auth_user');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.auth.get_auth_user(user.email),
                    'get_auth_user is not secured'
                  );
                }
              },

              intercept_backend_api: async (id_or_email) => {
                assert.equal(id_or_email, user.email);
                return 'proof.auth.get_auth_user';
              },
            }
          ]
        },


        remove_auth_user: {
          __tests: [
            {
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const result = await sdk.auth.remove_auth_user(user.email);
                  assert.equal(result, 'proof.auth.remove_auth_user');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.auth.remove_auth_user(user.email),
                    'remove_auth_user is not secured'
                  );
                }
              },

              intercept_backend_api: async (id_or_email) => {
                assert.equal(id_or_email, user.email);
                return 'proof.auth.remove_auth_user';
              },
            }
          ]
        },        


        identity_provider_create_auth_uri: {
          __tests: [
            () => {
              /** @type {OAuthProviderCreateURIParams} */
              const payload = {
                provider: 'google',
                redirect_uri: 'https://example.com/auth/callback',
                extra_parameters: {'k1': 'v1', 'k2': 'v2'},
              };

              return { // asert secured endpoint
                test: async () => {
                  sdk.config.auth = undefined;
                  const proof = await sdk.auth.identity_provider_get_authorization_uri(
                    payload
                  );
                  assert.equal(proof, 'proof.auth.identity_provider_create_auth_uri');
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params ,payload);
                  return 'proof.auth.identity_provider_create_auth_uri';
                },
              }
            },
          ]
        },        
        
        identity_provider_sign_with: {
          __tests: [
            () => {
              /** @type {SignWithOAuthProviderParams} */
              const payload = {
                provider: 'google',
                redirect_uri: 'https://example.com/auth/callback',
                authorization_response: {
                  code: 'authorization_code',
                  state: 'state',
                },
              };

              return { // asert secured endpoint
                test: async () => {
                  sdk.config.auth = undefined;
                  const proof = await sdk.auth.identity_provider_sign(
                    payload
                  );
                  assert.equal(proof, 'proof.auth.identity_provider_sign_with');
                },
                intercept_backend_api: async (params) => {
                  assert.equal(params ,payload);
                  return 'proof.auth.identity_provider_sign_with';
                },
              }
            },
          ]
        },        
        

        identity_providers_list: {
          __tests: [
            () => {

              return { // asert secured endpoint
                test: async () => {
                  sdk.config.auth = undefined;
                  const proof = await sdk.auth.identity_providers_list();
                  assert.equal(proof, 'proof.auth.identity_providers_list');
                },
                intercept_backend_api: async () => {
                  return 'proof.auth.identity_providers_list';
                },
              }
            },
          ]
        },        
                

        list_auth_users: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.auth.list_auth_users(
                    /** @type {ApiQuery<AuthUserType>} */(legit_query)
                  );
                  assert.equal(proof, 'proof.auth.list_auth_users');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.auth.list_auth_users(
                       /** @type {ApiQuery<AuthUserType>} */(legit_query)
                    ),
                    'list_auth_users is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params ,legit_query);
                return 'proof.auth.list_auth_users';
              },
            }
          ]
        },        
                 

        list_all_api_keys_info: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.auth.list_api_keys_auth_users();
                  assert.equal(proof, 'proof.auth.list_all_api_keys_info');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.auth.list_api_keys_auth_users(),
                    'list_all_api_keys_info is not secured'
                  );
                }
              },
              intercept_backend_api: async () => {
                return 'proof.auth.list_all_api_keys_info';
              },
            }
          ]
        },               
        
        count: {
          __tests: [
            { // asert secured endpoint
              test: async () => {
                { // secured
                  await sdk.auth.signin(user.email, user.password);
                  const proof = await sdk.auth.count_auth_users_query(
                    /** @type {ApiQuery<AuthUserType>} */(legit_query)
                  );
                  assert.equal(proof, 'proof.auth.count');
                }
                { // non secured
                  sdk.config.auth = undefined;
                  await assert_async_throws(
                    () => sdk.auth.count_auth_users_query(
                      /** @type {ApiQuery<AuthUserType>} */(legit_query)
                    ),
                    'count is not secured'
                  );
                }
              },
              intercept_backend_api: async (params) => {
                assert.equal(params ,legit_query);
                return 'proof.auth.count';
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