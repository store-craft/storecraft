/**
 * @import { chat_completion_chunk_result, chat_completion_input, chat_message, config 
 * } from "./types.js";
 * @import { AI, content, GenerateTextParams, GenerateTextResponse } from "../types.private.js";
 */

import { invoke_tool_safely } from "../index.js";
import { zod_to_json_schema } from "../json-schema.js";
import { SSEGenerator } from "../sse.js";
import { stream_accumulate } from "../stream-accumulate.js";
import { stream_message_builder } from "./stream-message-builder.js";


/**
 * @typedef {AI<config, chat_message>} Impl
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

    if(message.role!=='assistant')
      throw new Error("message.role !== 'assistant'");

    if(typeof message.content === 'string') {
      return [
        {
          content: message.content,
          type: 'text'
        }
      ];
    }
  
    if(Array.isArray(message.content)) {
      return message.content.map(
        (part) => {
          if('refusal' in part) {
            return {
              type:'error',
              content: {
                message: part.refusal
              },
            }
          } else {
            return {
              content: part.text,
              type: 'text'
            }
          }
        }
      )
    }
    
    return undefined;
  };


  /**
   * @description Transform our tools specification in to **OpenAI**
   * tools spec.
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
   * @param {boolean} [stream=false]
   */
  #text_complete = async (params, stream=false) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: params.history,
        tools: this.#to_native_tools(params.tools),
        stream: stream,
        tool_choice: 'auto'
      })
    );

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

    if(!result.ok) 
      throw (await result.text());
    
    return result;
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @return {AsyncGenerator<chat_completion_chunk_result>}
   */
   async * #text_complete_stream(params) {

    const stream = await this.#text_complete(params, true)
  
    for await (const frame of SSEGenerator(stream.body)) {
      if(frame.data==='[DONE]')
        continue;

      // console.log(frame);
      yield JSON.parse(frame.data);
    }
  }

  /**
   * 
   * @param {GenerateTextParams} params
   * @returns {AsyncGenerator<content>} 
   */
  async * #_gen_text_generator(params) {
    let max_steps = params.maxSteps ?? 6;

    params.history = [
      { // rewrite system prompt
        content: params.system,
        role: 'system'
      },
      ...(params.history ?? [])?.filter(m => m.role!=='system'),
      ...this.user_content_to_llm_user_message(params.prompt)
    ];

    let current_stream = this.#text_complete_stream(params);

    const builder = stream_message_builder();
    
    for await (const chunk of current_stream) {
      builder.add_delta(chunk);

      if(chunk?.choices?.[0].delta.content) {
        yield {
          type: 'delta_text',
          content: chunk.choices[0].delta.content
        }
      }

    }

    let current = builder.done();

    /** @type {content[]} */
    let contents = [];

    // while we are at a tool call, we iterate internally
    while(
      (current.choices?.[0].finish_reason === 'tool_calls') &&
      (max_steps > 0)
    ) {

      yield {
        type: 'tool_use',
        content: current.choices[0].message.tool_calls.map(
          tc => ({
            name: tc.function.name,
            id: tc.id
          })
        )
      }

      max_steps -= 1;

      // push `assistant` message into history
      params.history.push(current.choices[0].message);

      // invoke tools
      for(const tool_call of current.choices[0].message.tool_calls) {

        // add tools results messages
        const tool_result = await invoke_tool_safely(
          params.tools[tool_call.function.name],
          JSON.parse(tool_call.function.arguments)
        );

        yield {
          type: 'tool_result',
          content: {
            data: tool_result,
            id: tool_call.id
          }
        }

        params.history.push(
          {
            role: 'tool',
            tool_call_id: tool_call.id,
            content: JSON.stringify(
              tool_result
            )
          }
        );
      }

      // again
      current_stream = this.#text_complete_stream(params);
      
      const builder = stream_message_builder();
    
      for await (const chunk of current_stream) {
        builder.add_delta(chunk);
  
        if(chunk?.choices[0].delta.content) {
          yield {
            type: 'delta_text',
            content: chunk.choices[0].delta.content
          }
        }
        // console.log(chunk)
      }
  
      current = builder.done();  
          
    }

    // push `assistant` message into history
    params.history.push(current.choices[0].message);

    return {
      contents: this.llm_assistant_message_to_user_content(
        current.choices[0].message
      )
    };

  }
  
  
  /** @type {Impl["streamText"]} */
  streamText = async (params) => {
    
    /** @type {ReadableStream<content>} */
    const stream = new ReadableStream(
      {
        start: async (controller) => {
          try {
            for await (const m of this.#_gen_text_generator(params)) {
              controller.enqueue(m);
            }
          } catch(e) {
            controller.enqueue(
              {
                type: 'error',
                content: e
              }
            )
          } 

          controller.close();
        }
      }
    );

    return {
      stream
    }
  }
  
  /**
   * 
   * @type {Impl["generateText"]} 
   */
  generateText = async (params) => {
    const { stream } = await this.streamText(params);
    const result = await stream_accumulate(stream);
    return result;
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

