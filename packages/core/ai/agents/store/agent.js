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

      const sf = await this.#app.api.storefronts.get('default');
      const kvs = {
        store_info: store_info(this.#app),
        storefront_collections: sf.collections && sf.collections.map(c => ({title: c.title, handle: c.handle, description: c.description})),
        storefront_discounts: sf.discounts && sf.discounts.map(c => ({title: c.title, handle: c.handle, description: c.description})),
        storefront_shipping_methods: sf.shipping_methods && sf.shipping_methods.map(c => ({price:c.price, title: c.title, handle: c.handle, description: c.description})),
        storefront_description: sf.description,
        search_tags_for_products: (await this.#app.api.products.list_all_products_tags()).map(t => `tag:${t}`),
      }

      const { stream } = await this.provider.streamText(
        {
          history: history?.toArray()?.slice(-params.maxLatestHistoryToUse) ?? [],
          prompt: params.prompt,
          system: SYSTEM(kvs),
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
          system: SYSTEM(store_info(this.#app)),
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

/**
 * 
 * @param {App} app 
 */
const store_info = (app) => {
  const c = app.config;
  return [
    c.general_store_name && `- The store name is **${c.general_store_name}**`,
    c.general_store_description && `- The store description is **${c.general_store_description}**`,
    c.general_store_website && `- The store url is **${c.general_store_website}**`,
    c.general_store_support_email && `- The store website url is **${c.general_store_support_email}**`,
  ].filter(Boolean).join('\n')
}