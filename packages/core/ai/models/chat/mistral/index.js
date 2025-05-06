/**
 * @import { ENV } from '../../../../types.public.js';
 * @import { config } from './types.js';
 */
import { OpenAI } from "../openai/index.js";

/**
 */
export class Mistral extends OpenAI {

  /** @satisfies {ENV<config>} */
  static MistralEnvConfig = /** @type{const} */ ({
    api_key: 'MISTRAL_API_KEY'
  });

  /**
   * @param {import("./types.js").config} config 
   */
  constructor(config) {
    super(
      {
        model: 'mistral-large-latest',
        api_version: 'v1',
        ...config,
        endpoint: 'https://api.mistral.ai/',
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[Mistral.MistralEnvConfig.api_key]; 
  }

}
