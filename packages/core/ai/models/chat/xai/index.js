import { OpenAI } from "../openai/index.js";

export class XAI extends OpenAI {

  /**
   * @param {import("./types.js").config} config 
   */
  constructor(config) {
    super(
      {
        ...config,
        endpoint: 'https://api.x.ai/',
        model: config.model ?? 'grok-2',
        api_version: config.api_version ?? 'v1'
      }
    )
  }
}