import { OpenAI } from "../openai/index.js";

export const ENV_XAI_API_KEY = 'XAI_API_KEY';

export class XAI extends OpenAI {

  /**
   * @param {import("./types.js").config} config 
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
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_XAI_API_KEY]; 
  }

}