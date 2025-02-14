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
    console.log(params)
    const { contents } = await this.provider.generateText(
      {
        history: params.history ?? [],
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
  }


}