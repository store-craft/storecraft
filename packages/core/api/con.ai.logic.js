/**
 * @import {  } from './types.api.js'
 * @import { 
 *  AgentRunParameters, AgentRunResponse, AgentRunStreamResponse 
 * } from '../ai/agents/types.js'
 */

import { App } from "../index.js";
import { assert } from "./utils.func.js";

/**
 * @param {App} app 
 */
export const speakWithAgentSync = (app) => 
  /**
   * @description speak with agent
   * @param {string} agent_handle agent identifier
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunResponse>}
   */
  async (agent_handle, params) => {
    const agent = app.agents?.[agent_handle];
    assert(
      agent,
      `Agent ${agent_handle} not found !`
    );

    return agent.run(
      params
    );
  }

/**
 * @param {App} app 
 */
export const speakWithAgentStream = (app) => 
  /**
   * @description speak with agent
   * @param {string} agent_handle agent identifier
   * @param {AgentRunParameters} params 
   * @returns {Promise<AgentRunStreamResponse>}
   */
  async (agent_handle, params) => {
    const agent = app.agents?.[agent_handle];
    assert(
      agent,
      `Agent ${agent_handle} not found !`
    );
    return agent.runStream(
      params
    );
  }


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    speakWithAgentSync: speakWithAgentSync(app),
    speakWithAgentStream: speakWithAgentStream(app),
  }
}