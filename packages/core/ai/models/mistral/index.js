import { OpenAI } from "../openai/index.js";

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
}
