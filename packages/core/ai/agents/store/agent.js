/**
 * @import { 
 *  Agent, AgentConfig, AgentRunParameters, AgentRunResponse, 
 *  AgentRunStreamResponse 
 * } from '../types.js'
 * @import { ChatAI } from '../../core/types.private.js'
 */

import { App } from "../../../index.js";
import { StorageHistoryProvider } from "../../core/history.js";
import { SYSTEM } from './agent.system.js';
import { TOOLS } from "./agent.tools.js";
import { id } from '../../../crypto/object-id.js'

/**
 * @description The main customer facing `store` agent
 * @template {ChatAI} [AI_PROVIDER=ChatAI]
 * @implements {Agent}
 */
export class StoreAgent {
  /** @type {App} */
  #app;

  /** @type {AgentConfig<AI_PROVIDER>} */
  config;

  /**
   * 
   * @param {AgentConfig<AI_PROVIDER>} [config] 
   */
  constructor(config={}) {
    this.config = {
      maxLatestHistoryToUse: 1000, 
      ...config
    };
    this.history_provider = new StorageHistoryProvider();
  }

  /**
   * @type {Agent["init"]}
   */
  init = (app) => {
    this.#app = app;
    this.provider.onInit(app);
  }

  get provider() {
    return this.config.chat_ai_provider ?? this.#app.ai_chat_provider;
  }

  /**
   * 
   * @type {Agent["runStream"]}
   */
  runStream = async (params) => {

    console.log(params);

    try {
      params.maxLatestHistoryToUse ??= this.config.maxLatestHistoryToUse;
      params.thread_id = params.thread_id ?? ('thread_' + id());

      const history = await this.history_provider.load(
        params.thread_id, this.#app
      );

      const { stream } = await this.provider.streamText(
        {
          history: history?.toArray()?.slice(-params.maxLatestHistoryToUse) ?? [],
          prompt: params.prompt,
          system: SYSTEM,
          tools: TOOLS({ app: this.#app}),
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
        stream,
        thread_id: params.thread_id
      }

    } catch(e) {
      console.log(e);

      throw e;
    }

  }

  /**
   * 
   * @type {Agent["run"]}
   */
  run = async (params) => {

    console.log(params);

    try {
      params.maxLatestHistoryToUse ??= this.config.maxLatestHistoryToUse;
      params.thread_id = params.thread_id ?? ('thread_' + id());

      const history = await this.history_provider.load(
        params.thread_id, this.#app
      );

      const { 
        contents, delta_messages 
      } = await this.provider.generateText(
        {
          history: history?.toArray()?.slice(-params.maxLatestHistoryToUse) ?? [],
          prompt: params.prompt,
          system: SYSTEM,
          tools: TOOLS({ app: this.#app}),
          maxSteps: params.maxSteps,
          maxTokens: params.maxTokens
        }
      );

      await history.add(...delta_messages).commit();
  
      return {
        contents,
        thread_id: params.thread_id
      }

    } catch(e) {
      console.log(e);

      throw e;
    }

  }

}