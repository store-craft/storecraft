import { OpenAI } from "../openai/index.js";

export const ENV_GEMINI_API_KEY = 'GEMINI_API_KEY';

export class Gemini extends OpenAI {

  /**
   * @param {import("./types.js").config} config 
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
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_GEMINI_API_KEY]; 
  }

}

