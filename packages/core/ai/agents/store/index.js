/**
 * @import { 
 *  Agent, AgentConfig,
 AgentRunParameters, 
 * } from '../types.js'
 * @import { ChatAI } from '../../core/types.private.js'
 * @import { StorefrontType } from '../../../api/types.public.js';
 */
import { App } from "../../../index.js";
import { StorageHistoryProvider } from "../../core/history.js";
import { SYSTEM } from './agent.system.js';
import { TOOLS } from "./agent.tools.js";
import { id } from '../../../crypto/object-id.js'
import { content_stream_accumulate } from "../../core/content-utils.js";
import { ID } from "../../../api/utils.func.js";

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
   * @param {AgentConfig<AI_PROVIDER>} [config] 
   */
  constructor(config={}) {
    this.config = {
      maxLatestHistoryToUse: Infinity, 
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
    return this.config.chat_ai_provider ?? 
      this.#app.ai_chat_provider;
  }

  /**
   * @type {Agent["runStream"]}
   */
  runStream = async (params) => {

    console.log(params);

    try {
      params.maxLatestHistoryToUse ??= 
        this.config.maxLatestHistoryToUse;
      
      const is_new_chat = !Boolean(params.thread_id);

      params.thread_id = params.thread_id ?? (ID('chat'));

      const [history, kvs] = await Promise.all([
        this.history_provider.load(
          params.thread_id, this.#app
        ),
        storefront_to_kvs(this.#app),
      ]);

      const { stream } = await this.provider.streamText(
        {
          history: history?.toArray()?.slice(
            -params.maxLatestHistoryToUse
          ) ?? [],
          prompt: params.prompt,
          system: SYSTEM(kvs),
          tools: TOOLS({ app: this.#app}),
          maxSteps: params.maxSteps,
          maxTokens: params.maxTokens
        },
        {
          onDone: async (contents=[]) => {
            { // OPTIMIZATION: perform a compare, if params.metadata contains
              // new data, then we need to save it in 
              // database
              const saved_metadata = /** @type {AgentRunParameters["metadata"]} */(
                history.metadata()
              );
              params.metadata
            }

            await Promise.all([
              history.add(
                { // add user prompt
                  role: 'user',
                  contents: params.prompt
                }
              ).add(
                { // add assistant generated contents
                  role: 'assistant',
                  contents: contents
                }
              ).commit(params.metadata),
              this.#app.api.chats.upsert(
                {
                  id: params.thread_id,
                  extra: params.metadata?.extra,
                  customer_email: params.metadata?.customer_email,
                  customer_id: params.metadata?.customer_id,
                  search: params.metadata?.search,
                }
              ),
            ])

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
   * @type {Agent["run"]}
   */
  run = async (params) => {

    console.log(params);

    const {
      stream,
      thread_id
    } = await this.runStream(params)

    return {
      thread_id,
      contents: await content_stream_accumulate(stream)
    }
  }

}

/**
 * @description Summarize the storefront information
 * @param {App} app 
 * @param {StorefrontType} [sf] 
 */
const storefront_to_kvs = async (app, sf) => {
  sf ??= await app.api.storefronts.get_default_auto_generated_storefront();
  sf.all_used_products_tags ??= 
    await app.api.products.list_used_products_tags() ?? [];
  
  const kvs = {
    store_info: store_info(app),

    storefront_collections: sf.collections?.map(
      c => ({title: c.title, handle: c.handle, description: c.description})
    ) ?? [],

    storefront_discounts: sf.discounts?.map(
      c => ({title: c.title, handle: c.handle, description: c.description})
    ) ?? [],

    storefront_shipping_methods: sf.shipping_methods?.map(
      c => ({price:c.price, title: c.title, handle: c.handle, description: c.description})
    ) ?? [],

    storefront_description: sf.description,

    search_tags_for_products: sf.all_used_products_tags.map(
      t => `tag:${t}`
    ),
  }

  return kvs;
}

/**
 * @param {App} app 
 */
const store_info = (app) => {
  const c = app.config;
  return [
    c.general_store_name && 
    `- The store name is **${c.general_store_name}**`,
    c.general_store_description && 
    `- The store description is **${c.general_store_description}**`,
    c.general_store_website && 
    `- The store url is **${c.general_store_website}**`,
    c.general_store_support_email && 
    `- The store website url is **${c.general_store_support_email}**`,
  ].filter(Boolean).join('\n')
}