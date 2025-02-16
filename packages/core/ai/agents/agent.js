/**
 * @import { AgentConfig, AgentRunParameters, AgentRunResponse } from './types.js'
 * @import { AI } from '../types.private.js'
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
   * @returns {Promise<AgentRunResponse>}
   */
  run = async (params) => {

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
        }
      );
  
      return {
        contents: null
      }

    } catch(e) {
      console.log(e);

      return {
        contents: [
          {
            type: 'error',
            content: "Something went wrong",
            meta_data: {
              native: (e instanceof Error) ? e?.toString() : e
            }
          }
        ]
      }
    }

  }

    /**
   * 
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunResponse>}
   */
  run_OLD = async (params) => {

    console.log(params);

    try {

      const history = await this.#config.history_provider.load(
        params.thread_id, this.#app
      );

      const { contents } = await this.provider.generateText(
        {
          history: history.toArray() ?? [],
          prompt: params.prompt,
          system: SYSTEM,
          tools: TOOLS,
          maxSteps: params.maxSteps,
          maxTokens: params.maxTokens
        }
      );
  
      return {
        contents: contents
      }

    } catch(e) {
      console.log(e);

      return {
        contents: [
          {
            type: 'error',
            content: "Something went wrong",
            meta_data: {
              native: (e instanceof Error) ? e?.toString() : e
            }
          }
        ]
      }
    }

  }


}