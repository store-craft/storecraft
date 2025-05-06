/**
 * @import { ENV } from '../../../../types.public.js';
 * @import { config } from './types.js';
 */
import { OpenAI } from "../openai/index.js";

export class Gemini extends OpenAI {

  /** @satisfies {ENV<config>} */
  static GeminiEnvConfig = /** @type{const} */ ({
    api_key: 'GEMINI_API_KEY'
  });

  /**
   * @param {config} config 
   */
  constructor(config) {
    super(
      {
        model: 'gemini-2.0-flash',
        ...config,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        // @ts-ignore
        api_version: ''
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[Gemini.GeminiEnvConfig.api_key]; 
  }

}

