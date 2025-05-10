/**
 * @import { ENV } from '../../../../types.public.js';
 * @import { config } from './types.js';
 */
import { OpenAI } from "../openai/index.js";

export class XAI extends OpenAI {

  /** @satisfies {ENV<config>} */
  static XAIEnvConfig = /** @type{const} */ ({
    api_key: 'XAI_API_KEY'
  });

  /**
   * @param {config} config 
   */
  constructor(config={}) {
    super(
      {
        model: 'grok-3',
        api_version: 'v1',
        ...config,
        endpoint: 'https://api.x.ai/',
        __hooks: {
          pre_request: (request) => {
            // grok-3 does not support function strict mode.
            for (const tool of (request?.tools ?? [])) {
              tool.function.strict = false;
            }
            return request;
          }
        }
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.__show_me_everything.platform.env[XAI.XAIEnvConfig.api_key]; 
  }

}