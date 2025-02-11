/**
 * @import { 
 *  chat_completion_chunk_result, chat_completion_input, chat_completion_result, 
 *  general_chat_completion_message, openai_config, tool_chat_completion_message 
 * } from "./types.js";
 * @import { AI, Tool } from "../types.js";
 */

import { zod_to_json_schema } from "../json-schema.js";

/**
 * @typedef {AI<openai_config, general_chat_completion_message | tool_chat_completion_message, chat_completion_result>} OpenAIImpl
 */

/**
 * @implements {OpenAIImpl}
 */
export class OpenAI {
  #chat_completion_url = '';
  #chat_models_url = '';

  /**
   * @param {openai_config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      model: config.model ?? 'gpt-4o',
      endpoint: config.endpoint ?? 'https://api.openai.com/',
      api_version: config.api_version ?? 'v1'
    }

    this.#chat_completion_url = new URL(
      this.config.api_version + '/chat/completions', 
      this.config.endpoint
    ).toString();

    this.#chat_models_url = new URL(
      this.config.api_version + '/chat/models', 
      this.config.endpoint
    ).toString();
  }

  /**
   * 
   * @param {Tool[]} tools 
   * @return {chat_completion_input["tools"]}
   */
  #to_oai_tools = (tools) => {
    return tools.map(
      (tool) => (
        {
          type: 'function',
          function: {
            description: tool.schema.description,
            name: tool.schema.name,
            parameters: zod_to_json_schema(tool.schema.parameters)
          } 
        }
      )
    );
  }

  /**
   * @param {OpenAIImpl["__gen_text_params_type"]} params
   * @return {Promise<OpenAIImpl["__gen_text_response_type"]>}
   */
  #text_complete = async (params) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: params.messages,
        tools: this.#to_oai_tools(params.tools),
        stream: false,
        tool_choice: 'auto'
      })
    );

    console.log(JSON.stringify(body.tools, null, 2))

    const result = await fetch(
      this.#chat_completion_url,
      {
        method: 'POST',
        body: JSON.stringify(body),
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
      this.#chat_models_url,
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

