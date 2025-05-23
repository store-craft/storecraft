/**
 * @import { 
 *  SimilaritySearchInput,
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../api/api.utils.js';
import { App } from '../../index.js';
import esMain from '../api/utils.esmain.js';
import { setup_sdk } from './utils.setup-sdk.js';
import { test_setup } from './utils.api-layer.js';
import { admin_email } from '../api/auth.js';
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
      assert.ok(app.isready);
      app.__show_me_everything.rest_controller.logger.active=false;
    }
  );

  s.after(
    async () => { 
      app.__show_me_everything.rest_controller.logger.active=true;
    }
  );

  s('search', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      search: {

        quicksearch: {
          __tests: [
            () => {
              const legit_query = parse_query(
                api_query_to_searchparams({
                  limit: 10,
                  order: 'desc',
                  vql: 'active:true'
                })
              );
          
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    const proof = await sdk.search.quick(legit_query);
                    assert.equal(proof, 'proof.search.quicksearch');
                  }
                },
                intercept_backend_api: async ($query) => {
                  assert.equal($query, legit_query);
                  return 'proof.search.quicksearch';
                },
              }
            }
          ]
        },        
                
        
        similarity: {
          __tests: [
            () => {

              /** @type {SimilaritySearchInput} */
              const similarity_input = {
                q: 'i am looking for a game about nordic gods',
                limit: 10,
                namespaces: [
                  'products'
                ]
              }

              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    const proof = await sdk.search.similarity(similarity_input);
                    assert.equal(proof, 'proof.search.similarity');
                  }
                },
                intercept_backend_api: async ($query) => {
                  assert.equal($query, similarity_input);
                  return 'proof.search.similarity';
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