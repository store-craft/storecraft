/**
 * @import { 
 *  chat_completion_input, claude_completion_response,
 *  config, claude_message
 * } from "./types.js";
 * @import { AI, content } from "../types.private.js";
 */

import { invoke_tool_safely } from "../index.js";
import { zod_to_json_schema } from "../json-schema.js";

/**
 * @typedef {AI<config, claude_message>} Impl
 */

/**
 * @implements {Impl}
 */
export class Anthropic {
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
   * @return {Promise<claude_completion_response>}
   */
  #text_complete = async (params) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: params.history,
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

    if(!result.ok) {
      throw (await result.text());
    }

    return (await result.json());
  }

  /** @type {Impl["user_content_to_llm_user_message"]} */
  user_content_to_llm_user_message = (prompts) => {
    return prompts.map(
      (pr) => (
        {
          role: 'user',
          content: pr.content
        }
      )
    )
  };

  /** @type {Impl["llm_assistant_message_to_user_content"]} */
  llm_assistant_message_to_user_content = (message) => {
    if(message.role!=='assistant') {
      throw new Error(
        "llm_assistant_message_to_user_content:: message.role!=='assistant'"
      );
    }

    if(typeof message.content === 'string') {
      return [
        {
          content: message.content,
          type: 'text'
        }
      ];
    }
  
    if(Array.isArray(message.content)) {
      return message.content.filter(p => p.type==='text').map(
        (part) => (
          {
            type: 'text',
            content: part.text
          }
        )
      )
    }
    
    throw new Error("llm_assistant_message_to_user_content:: invalid data");;  
  };


  /**
   * 
   * @type {Impl["generateText"]} 
   */
  generateText = async (params) => {

    let max_steps = params.maxSteps ?? 6;

    params.history = [
      ...(params.history ?? []),
      ...this.user_content_to_llm_user_message(params.prompt)
    ];

    let current = await this.#text_complete(params);
    /** @type {content[]} */
    let contents = [];

    // console.log(JSON.stringify(current, null, 2));
    // return;

    // while we are at a tool call, we iterate internally
    while(
      (current.stop_reason === 'tool_use') &&
      (max_steps > 0)
    ) {

      max_steps -= 1;
      console.log(max_steps)
      // push `assistant` message into history
      params.history.push(
        {
          role: current.role,
          content: current.content
        }
      );

      // invoke tools
      for(const tool_call of current.content.filter(it => it.type==='tool_use')) {

        // add tools results messages
        params.history.push(
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: tool_call.id,
                content: JSON.stringify(
                  await invoke_tool_safely(
                    params.tools[tool_call.name],
                    tool_call.input
                  )
                )
              }
            ]
            // 
          }
        );
      }

      // again
      current = await this.#text_complete(params);
    }

    // push `assistant` message into history
    params.history.push(
      {
        role: 'assistant',
        content: current.content
      }
    );

    console.log('history', JSON.stringify(params.history, null, 2))

    return {
      contents: this.llm_assistant_message_to_user_content(
        current
      )
    };

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

