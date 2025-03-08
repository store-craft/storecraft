/**
 * @import { ENV } from '../../../../types.public.js';
 * @import { config } from './types.js';
 */
import { OpenAI } from "../openai/index.js";

/** @type {ENV<config>} */
const EnvConfig = {
  api_key: 'GEMINI_API_KEY'
}

export class Gemini extends OpenAI {

  /**
   * @param {config} config 
   */
  constructor(config) {
    super(
      {
        ...config,
        api_key: config.api_key,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        model: config.model ?? 'gemini-2.0-flash',
        api_version: ''
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[EnvConfig.api_key]; 
  }

}

