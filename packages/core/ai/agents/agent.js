/**
 * @import { AgentRunParameters, AgentRunResponse } from './types.js'
 */

import { App } from "../../index.js";
import { SYSTEM } from './agent.system.js';
import { TOOLS } from "./agent.tools.js";

export class StoreAgent {
  /** @type {App} */
  #app;

  constructor() {

  }

  /**
   * 
   * @param {App} app 
   */
  init = (app) => {
    this.#app = app;
  }

  get ai() {
    return this.#app.ai;
  }

  /**
   * 
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunResponse>}
   */
  run = async (params) => {

    const { contents } = await this.ai.generateText(
      {
        history: params.history,
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