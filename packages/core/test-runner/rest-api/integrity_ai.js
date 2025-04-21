/**
 * @import { SimilaritySearchInput, TagType, TagTypeUpsert
 * } from '../../api/types.api.js'
 * @import { PROOF_MOCKUP_API_SETUP } from './types.js'
 * @import { ApiQuery } from '../../api/types.public.js'
 * @import { AgentRunParameters } from '../../ai/agents/types.js';
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
import { 
  api_query_to_searchparams, parse_query 
} from '../../api/utils.query.js';


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

  s('ai', async (ctx) => {
    const user = {
      email: admin_email,
      password: 'admin',
      firstname: 'John',
      lastname: 'Doe',
    }

    /** @type {PROOF_MOCKUP_API_SETUP} */
    const setup = {
      ai: {

        speakWithAgentSync: {
          __tests: [
            () => {
              const agent_handle = 'test_agent';
              /** @type {AgentRunParameters} */
              const agent_params = {
                maxLatestHistoryToUse: 5,
                maxTokens: 100,
                maxSteps: 5,
                thread_id: 'test_thread_id',
                prompt: [
                  {
                    type: 'text',
                    content: 'hello world'
                  }
                ]
              }
          
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    const proof = await sdk.ai.speak(agent_handle, agent_params);
                    assert.equal(proof, 'proof.ai.speakWithAgentSync');
                  }
                },
                intercept_backend_api: async ($agent_handle, $agent_params) => {
                  assert.equal($agent_handle, agent_handle);
                  assert.equal($agent_params, agent_params);
                  return 'proof.ai.speakWithAgentSync';
                },
              }
            }
          ]
        },        
                
        
        speakWithAgentStream: {
          __tests: [
            () => {
              
              const agent_handle = 'test_agent';
              /** @type {AgentRunParameters} */
              const agent_params = {
                maxLatestHistoryToUse: 5,
                maxTokens: 100,
                maxSteps: 5,
                thread_id: 'test_thread_id',
                prompt: [
                  {
                    type: 'text',
                    content: 'hello world'
                  }
                ]
              }

              let has_run = false;
          
              return { 
                test: async () => {
                  { // non-secured
                    sdk.config.auth = undefined;
                    const result =  await sdk.ai.streamSpeak(
                      agent_handle, agent_params
                    );
                    assert.equal(
                      result.threadId, agent_params.thread_id, 'thread-id doesnt match'
                    );
                    assert.ok(
                      result.generator, 'missing generator'
                    );
                  }
                },
                intercept_backend_api: async ($agent_handle, $agent_params) => {
                  assert.equal($agent_handle, agent_handle);
                  assert.equal($agent_params, agent_params);

                  return {
                    thread_id: $agent_params.thread_id,
                    stream: new ReadableStream(
                      {
                        start: async (controller) => {
                          controller.enqueue(
                            {
                              type: 'text',
                              content: 'hello world'
                            }
                          )
                          controller.close();
                        }
                      }
                    ),
                  }
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
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();