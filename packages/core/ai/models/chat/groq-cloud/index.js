/**
 * @import { ENV } from '../../../../types.public.js';
 * @import { ChatAI } from '../../../types.public.js';
 * @import { config } from './types.js';
 */
import { OpenAI } from "../openai/index.js";

/**
 * @typedef {ChatAI<config>} Impl
 */


export class GroqCloud extends OpenAI {

  /** @satisfies {ENV<config>} */
  static GroqEnvConfig = /** @type{const} */ ({
    api_key: 'GROQ_API_KEY'
  });
  
  /**
   * @param {config} config 
   */
  constructor(config) {
    super(
      {
        model: 'llama-3.3-70b-versatile',
        api_version: 'v1',
        ...config,
        endpoint: 'https://api.groq.com/openai/',
        __hooks: {
          pre_request: (request) => {
            // groq-cloud requires all assistant contents are not
            // array of content parts but a simple string.
            for (const tool of (request?.messages ?? [])) {
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
    this.config.api_key ??= 
      app.platform.env[GroqCloud.GroqEnvConfig.api_key]; 
  }

}

