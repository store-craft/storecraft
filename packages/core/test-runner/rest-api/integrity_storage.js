/**
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name, assert_async_throws } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
import { readable_stream_to_string } from './utils.streams.js';

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

  s('storage', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      storage: {

        features: {
          __tests: [
            () => {
          
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    const proof = await sdk.storage.features();
                    assert.equal(proof, 'proof.storage.features');
                  }
                },
                intercept_backend_api: async () => {
                  return 'proof.storage.features';
                },
              }
            }
          ]
        },        
                
        putStream: {
          __tests: [
            () => {
              const date = new Date().toISOString();
              const file_key = 'test_' + date + '.txt';
              const file_content = date;
              let proof_secured = '';

              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.storage.putBytesUnsigned(
                        file_key, file_content
                      ),  
                      'putStream not secured'
                    )
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    await sdk.storage.putBytesUnsigned(
                      file_key, file_content
                    );
                    assert.equal(
                      proof_secured, 'proof.storage.putStream',
                      'proof not secured'
                    );
                  }
                },
                intercept_backend_api: async ($file_key, $file_content_stream) => {
                  const $file_content = await readable_stream_to_string(
                    $file_content_stream
                  );
                  assert.equal($file_content, file_content);
                  assert.equal($file_key, file_key);
                  proof_secured = 'proof.storage.putStream';
                  return true;
                },
              }
            }
          ]
        },        
                        

        putSigned: {
          __tests: [
            () => {
              const date = new Date().toISOString();
              const file_key = 'test_put_signed_' + date + '.txt';
              const file_content = date;
              let proof_secured = '';
              
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.storage.putBytesSigned(file_key, file_content),  
                      'putSigned not secured'
                    )
                  }
                  { // secured
                    const supports_signed = (
                      await sdk.storage.features()
                    ).supports_signed_urls;

                    if(supports_signed) {
                      await sdk.auth.signin(user.email, user.password);
                      await sdk.storage.putBytesSigned(
                        file_key, file_content
                      );
                      assert.equal(
                        proof_secured, 'proof.storage.putSigned',
                        'proof not secured'
                      );
                    }
                  }
                },
                intercept_backend_api: async ($file_key) => {
                  assert.equal($file_key, file_key);
                  proof_secured = 'proof.storage.putSigned';
                  return {
                    method: 'post',
                    url: `http://localhost/api/storage/${file_key}?signed=false`,
                  };
                },
              }
            }
          ]
        },                
        

        getStream: {
          __tests: [
            () => {
              const date = new Date().toISOString();
              const file_key = 'test_getStream_' + date + '.txt';
              const file_content = date;
              let proof_secured = '';
              
              return { 
                test: async () => {
                  { // non-secured
                    {
                      await sdk.auth.signin(user.email, user.password);
                      await sdk.storage.putBytes(
                        file_key, file_content
                      );
                    }
                    // signout
                    sdk.config.auth = undefined;
                    const blob = await sdk.storage.getBlobUnsigned(
                      file_key
                    );
                    const blob_text = await blob.text();
                    assert.equal(
                      blob_text, file_content,
                      'blob does not match'
                    );

                    assert.equal(
                      proof_secured, 'proof.storage.getStream',
                      'proof not secured'
                    );
                  }
                },
                intercept_backend_api: async ($file_key) => {
                  assert.equal($file_key, file_key);
                  proof_secured = 'proof.storage.getStream';
                  return {
                    value: new ReadableStream(
                      {
                        start: async (controller) => {
                          controller.enqueue(
                            (new TextEncoder).encode(file_content)
                          );
                          controller.close();
                        }
                      }
                    ),
                  };
                },
              }
            }
          ]
        },     
        
        
        getSigned: {
          __tests: [
            () => {
              const date = new Date().toISOString();
              const file_key = 'test_getSigned_' + date + '.txt';
              const file_content = date;
              let proof_secured = '';
              
              return { 
                test: async () => {
                  { // non-secured
                    const supports_signed = (
                      await sdk.storage.features()
                    ).supports_signed_urls;

                    if(!supports_signed)
                      return;

                    sdk.config.auth = undefined;
                    const blob = await sdk.storage.getBlobSigned(
                      file_key
                    );

                    const blob_text = await blob.text();
                    assert.equal(
                      blob_text, file_content,
                      'blob does not match'
                    );

                    assert.equal(
                      proof_secured, 'proof.storage.getSigned',
                      'proof does not match'
                    );
                  }
                },
                intercept_backend_api: async ($file_key) => {
                  assert.equal($file_key, file_key);
                  proof_secured = 'proof.storage.getSigned';
                  return {
                    method: 'get',
                    url: `http://localhost/api/storage/${file_key}?signed=false`,
                  };
                },
              }
            }
          ]
        },     


        remove: {
          __tests: [
            () => {
              const date = new Date().toISOString();
              const file_key = 'test_remove_' + date + '.txt';
              const file_content = date;
              let proof_secured = '';
              
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    await assert_async_throws(
                      () => sdk.storage.delete(file_key),  
                      'remove not secured'
                    )
                  }
                  { // secured
                    await sdk.auth.signin(user.email, user.password);
                    await sdk.storage.putBytesUnsigned(
                      file_key, file_content
                    );
                    const success = await sdk.storage.delete(file_key);
                    assert.equal(success, true);
                    assert.equal(
                      proof_secured, 'proof.storage.remove',
                      'proof doesnt match'
                    );
                  }
                },
                intercept_backend_api: async ($file_key) => {
                  assert.equal($file_key, file_key);
                  proof_secured = 'proof.storage.remove';
                  return true;
                },
              }
            }
          ]
        },                
                     
      }

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