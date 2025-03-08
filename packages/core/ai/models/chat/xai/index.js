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
        ...config,
        endpoint: 'https://api.x.ai/',
        model: config.model ?? 'grok-2',
        api_version: config.api_version ?? 'v1'
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[XAI.XAIEnvConfig.api_key]; 
  }

}