/**
 * @import { AgentConfig, AgentRunParameters, AgentRunResponse, AgentRunStreamResponse } from './types.js'
 * @import { AI } from '../core/types.private.js'
 */

import { App } from "../../index.js";
import { SYSTEM } from './agent.system.js';
import { TOOLS } from "./agent.tools.js";

/**
 * @template {AI} [AI_PROVIDER=AI]
 */
export class StoreAgent {
  /** @type {App} */
  #app;

  /** @type {AgentConfig<AI_PROVIDER>} */
  #config;

  /**
   * 
   * @param {AgentConfig<AI_PROVIDER>} config 
   */
  constructor(config) {
    this.#config = config;
  }

  /**
   * 
   * @param {App} app 
   */
  init = (app) => {
    this.#app = app;
  }

  get provider() {
    return this.#config.ai;
  }

  /**
   * 
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunStreamResponse>}
   */
  runStream = async (params) => {

    console.log(params);

    try {

      const history = await this.#config.history_provider.load(
        params.thread_id, this.#app
      );

      const { stream } = await this.provider.streamText(
        {
          history: history.toArray() ?? [],
          prompt: params.prompt,
          system: SYSTEM,
          tools: TOOLS,
          maxSteps: params.maxSteps,
          maxTokens: params.maxTokens
        },
        {
          onDone: async (messages) => {
            await history.add(...messages).commit();
          }
        }
      );
  
      return {
        stream
      }

    } catch(e) {
      console.log(e);

      throw e;
    }

  }

  /**
   * 
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunResponse>}
   */
  run = async (params) => {

    console.log(params);

    try {

      const history = await this.#config.history_provider.load(
        params.thread_id, this.#app
      );

      const { 
        contents, delta_messages 
      } = await this.provider.generateText(
        {
          history: history.toArray() ?? [],
          prompt: params.prompt,
          system: SYSTEM,
          tools: TOOLS,
          maxSteps: params.maxSteps,
          maxTokens: params.maxTokens
        }
      );

      await history.add(...delta_messages).commit();
  
      return {
        contents
      }

    } catch(e) {
      console.log(e);

      throw e;
    }

  }


}