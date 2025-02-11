import { OpenAI } from "../openai/index.js";



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

}

