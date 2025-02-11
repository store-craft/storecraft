/**
 * @import { 
 *  chat_completion_chunk_result, chat_completion_result, 
 *  general_chat_completion_message, openai_config, tool_chat_completion_message 
 * } from "./types.js";
 * @import { AI } from "../types.js";
 */

/**
 * @typedef {AI<openai_config, general_chat_completion_message | tool_chat_completion_message, chat_completion_result>} OpenAIImpl
 */

/**
 * @implements {OpenAIImpl}
 */
export class OpenAI {
  /**
   * @param {openai_config} config 
   */
  constructor(config) {
    this.config = config
  }

  /**
   * @param {OpenAIImpl["__gen_text_params_type"]} params
   * @return {Promise<OpenAIImpl["__gen_text_response_type"]>}
   */
  #text_complete = async (params) => {
    const result = await fetch(
      this.config.endpoint,
      {
        method: 'POST',
        body: JSON.stringify(
          {
            model: this.config.model,
            messages: params.messages,
            tools: params.tools,
            stream: false,
            tool_choice: 'auto'
          }
        ),
        headers: {
          "Authorization" : `Bearer ${this.config.api_key}`,
          "Content-Type": "application/json"
        }
      }
    );

    if(false) {
      for await(const chunk of result.body) {
        console.log(new TextDecoder().decode(chunk), '\n\n\n')
      }
    }

    return result.json();
  }

  /**
   * 
   * @type {OpenAIImpl["generateText"]} 
   */
  generateText = async (params) => {
    try {
      const result = await this.#text_complete(params);

      // console.log(JSON.stringify(input, null, 2))

      return result;

    } catch (e) {
      console.log('OpenAI', e)
    } finally {

    }

    return undefined;
  }

  models = async () => {

    const r = await fetch(
      'https://api.openai.com/v1/models',
      {
        method: 'get',
        headers: {
          'Authorization': 'Bearer ' + this.config.api_key,
          "Content-Type": 'application/json'
        }
      }
    );

    return r.json();
  }

}