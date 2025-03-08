/**
 * @import { ENV } from '../../../../types.public.js';
 * @import { config } from './types.js';
 */
import { OpenAI } from "../openai/index.js";

/** @type {ENV<config>} */
const EnvConfig = {
  api_key: 'GROQ_API_KEY'
}

export class Groq extends OpenAI {

  /**
   * @param {import("./types.js").config} config 
   */
  constructor(config) {
    super(
      {
        ...config,
        endpoint: 'https://api.groq.com/openai/',
        model: config.model ?? 'llama-3.3-70b-versatile',
        api_version: config.api_version ?? 'v1'
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[EnvConfig.api_key]; 
  }

}

