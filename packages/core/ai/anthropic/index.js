/**
 * @import { 
 *  chat_completion_input, claude_completion_response,
 *  config, claude_message
 * } from "./types.js";
 * @import { AI, Tool } from "../types.js";
 */

import { zod_to_json_schema } from "../json-schema.js";

/**
 * @typedef {AI<
 *  config, 
 *  claude_message, 
 *  claude_completion_response
 * >} Impl
 */

/**
 * @implements {Impl}
 */
export class Claude {
  #chat_completion_url = '';
  #chat_models_url = '';
  #anthropic_endpoint = 'https://api.anthropic.com'

  /**
   * @param {config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      model: config.model ?? 'claude-3-5-sonnet-20241022',
      api_version: config.api_version ?? 'v1',
      anthropic_version: config.anthropic_version ?? "2023-06-01"
    }

    this.#chat_completion_url = new URL(
      this.config.api_version + '/messages', 
      this.#anthropic_endpoint
    ).toString();

    this.#chat_models_url = new URL(
      this.config.api_version + '/models', 
      this.#anthropic_endpoint
    ).toString();
  }

  /**
   * 
   * @param {Impl["__gen_text_params_type"]["tools"]} tools 
   * @return {chat_completion_input["tools"]}
   */
  #to_native_tools = (tools) => {
    return Object.entries(tools).map(
      ([name, tool]) => (
        { 
          input_schema: zod_to_json_schema(tool.schema.parameters),
          name: name,
          description: tool.schema.description,
        }
      )
    );
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @return {Promise<Impl["__gen_text_response_type"]>}
   */
  #text_complete = async (params) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: [
          ...params.history,
          this.translateUserPrompt(params.prompt)
        ].filter(Boolean),
        system: params.system,
        tools: this.#to_native_tools(params.tools),
        stream: false,
        tool_choice: { type: 'auto' },
        max_tokens: params.maxTokens ?? 1024
      })
    );

    // console.log(JSON.stringify(body, null, 2))
    // return;

    const result = await fetch(
      this.#chat_completion_url,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'x-api-key' : this.config.api_key,
          'Content-Type': 'application/json',
          'anthropic-version': this.config.anthropic_version
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

    /** @type {Impl["translateUserPrompt"]} */
    translateUserPrompt = (prompt) => {
      return {
        role: 'user',
        content: prompt.content
      }
    };
  
  /**
   * 
   * @type {Impl["generateText"]} 
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
          'x-api-key': this.config.api_key,
          'anthropic-version': this.config.anthropic_version
        }
      }
    );

    return r.json();
  }

}

