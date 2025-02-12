/**
 * @import { 
 *  chat_completion_input, chat_completion_result, 
 *  chat_message, config 
 * } from "./types.js";
 * @import { AI, content } from "../types.js";
 */

import { invoke_tool_safely } from "../index.js";
import { zod_to_json_schema } from "../json-schema.js";
import { assistant_message_to_content } from "./utils.js";

/**
 * @typedef {AI<
 *  config, 
 *  chat_message
 * >} Impl
 */

/**
 * @implements {Impl}
 */
export class OpenAI {
  #chat_completion_url = '';
  #chat_models_url = '';

  /**
   * @param {config} config 
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
      this.config.api_version + '/models', 
      this.config.endpoint
    ).toString();
  }

  /** @type {Impl["translateUserPrompt"]} */
  translateUserPrompt = (prompts) => {
    return prompts.map(
      (pr) => (
        {
          role: 'user',
          content: pr.content
        }
      )
    )
  };

  /**
   * 
   * @param {Impl["__gen_text_params_type"]["tools"]} tools 
   * @return {chat_completion_input["tools"]}
   */
  #to_native_tools = (tools) => {
    return Object.entries(tools).map(
      ([name, tool]) => (
        {
          type: 'function',
          function: {
            description: tool.schema.description,
            name: name,
            parameters: zod_to_json_schema(tool.schema.parameters)
          } 
        }
      )
    );
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @return {Promise<chat_completion_result>}
   */
  #text_complete = async (params) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: params.history,
        tools: this.#to_native_tools(params.tools),
        stream: false,
        tool_choice: 'auto'
      })
    );

    // console.log(JSON.stringify(body, null, 2))

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
   * @type {Impl["generateText"]} 
   */
  generateText = async (params) => {

    let max_steps = params.maxSteps ?? 6;

    params.history = [
      { // rewrite system prompt
        content: params.system,
        role: 'system'
      },
      ...params.history?.filter(m => m.role!=='system'),
      ...this.translateUserPrompt(params.prompt)
    ];

    try {
      let current = await this.#text_complete(params);
      /** @type {content[]} */
      let contents = [];

      // console.log(JSON.stringify(current, null, 2));
      // return;

      // while we are at a tool call, we iterate internally
      while(
        (current.choices[0].finish_reason === 'tool_calls') &&
        (max_steps > 0)
      ) {

        max_steps -= 1;
        console.log(max_steps)
        // push `assistant` message into history
        params.history.push(current.choices[0].message);

        // invoke tools
        for(const tool_call of current.choices[0].message.tool_calls) {

          // add tools results messages
          params.history.push(
            {
              role: 'tool',
              tool_call_id: tool_call.id,
              content: JSON.stringify(
                await invoke_tool_safely(
                  params.tools[tool_call.function.name],
                  JSON.parse(tool_call.function.arguments)
                )
              )
            }
          );
        }

        // again
        current = await this.#text_complete(params);
      }

      // push `assistant` message into history
      params.history.push(current.choices[0].message);

      console.log('history', JSON.stringify(params.history, null, 2))

      return {
        contents: assistant_message_to_content(
          current.choices[0].message
        )
      };

    } catch (e) {
      console.log('OpenAI', e);

      return undefined;
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
          'Authorization': 'Bearer ' + this.config.api_key
        }
      }
    );

    return r.json();
  }

}

