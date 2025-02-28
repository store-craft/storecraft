import { OpenAI } from "../openai/index.js";

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

}

