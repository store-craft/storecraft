import { OpenAI } from "../openai/index.js";

export const ENV_MISTRAL_API_KEY = 'MISTRAL_API_KEY';

export class Mistral extends OpenAI {

  /**
   * @param {import("./types.js").config} config 
   */
  constructor(config) {
    super(
      {
        ...config,
        api_key: config.api_key,
        endpoint: 'https://api.mistral.ai/',
        model: config.model ?? 'mistral-large-latest',
        api_version: config.api_version ?? 'v1'
      }
    )
  }

  /** @type {OpenAI["onInit"]} */
  onInit = (app) => {
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_MISTRAL_API_KEY]; 
  }

}
