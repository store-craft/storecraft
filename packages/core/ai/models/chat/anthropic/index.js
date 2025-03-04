/**
 * @import { 
 *  chat_completion_input, config, claude_message, stream_event, 
 *  text_content, image_content,
 * } from "./types.js";
 * @import { 
 *  ChatAI, content, GenerateTextParams, StreamTextCallbacks 
 * } from "../../../core/types.private.js";
 */

import { invoke_tool_safely } from "../../../core/tools.js";
import { zod_to_json_schema } from "../../../core/json-schema.js";
import { SSEGenerator } from "../../../core/sse.js";
import { stream_accumulate } from "../../../core/stream-accumulate.js";
import { stream_message_builder } from "./stream-message-builder.js";

/**
 * @typedef {ChatAI<config, claude_message>} Impl
 */

export const ENV_ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';

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

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_ANTHROPIC_API_KEY]; 
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
          input_schema: zod_to_json_schema(tool.schema),
          name: name,
          description: tool.description,
        }
      )
    );
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @param {boolean} [stream=false]
   */
  #text_complete = async (params, stream) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: params.history,
        system: params.system,
        tools: this.#to_native_tools(params.tools),
        stream: stream,
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

    // if(false) {
    //   for await(const chunk of result.body) {
    //     console.log(new TextDecoder().decode(chunk), '\n\n\n')
    //   }
    // }

    if(!result.ok) {
      throw (await result.text());
    }

    return result;
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @return {AsyncGenerator<stream_event>}
   */
  async * #text_complete_stream(params) {

    const stream = await this.#text_complete(params, true);
  
    for await (const frame of SSEGenerator(stream.body)) {
      // console.log(frame);
      yield JSON.parse(frame.data);
    }
  }

  /**
   * 
   * @param {GenerateTextParams<claude_message>} params
   * @param {StreamTextCallbacks<claude_message>} [callbacks]
   * @returns {AsyncGenerator<content>} 
   */
  async * #_gen_text_generator(params, callbacks) {
    let max_steps = params.maxSteps ?? 6;
    const base_history_length = params.history.length;

    params.history = [
      ...(params.history ?? []),
      this.user_content_to_llm_user_message(params.prompt)
    ];

    let current_stream = this.#text_complete_stream(params);

    const builder = stream_message_builder();
    
    for await (const chunk of current_stream) {
      builder.add_delta(chunk);

      if(
        (chunk.type==='content_block_delta') &&
        (chunk.delta.type==='text_delta')
      ){
        yield {
          type: 'delta_text',
          content: chunk.delta.text
        }
      }

    }

    let current = builder.done();

    // while we are at a tool call, we iterate internally
    while(
      (current.stop_reason === 'tool_use') &&
      (max_steps > 0)
    ) {

      yield {
        type: 'tool_use',
        content: current.content.filter(
          c => c.type==='tool_use'
        ).map(
          tc => ({
            name: tc.name,
            id: tc.id,
            title: params.tools?.[tc.name].title
          })
        )
      }

      max_steps -= 1;

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
        const tool_result = await invoke_tool_safely(
          params.tools[tool_call.name],
          tool_call.input
        );

        yield {
          type: 'tool_result',
          content: {
            data: tool_result,
            id: tool_call.id,
            name: tool_call.name
          }
        }

        params.history.push(
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: tool_call.id,
                content: JSON.stringify(tool_result)
              }
            ]
          }
        );
      }

      // again
      current_stream = this.#text_complete_stream(params);
      
      const builder = stream_message_builder();
    
      for await (const chunk of current_stream) {
        builder.add_delta(chunk);
  
        if(
          (chunk.type==='content_block_delta') &&
          (chunk.delta.type==='text_delta')
        ){
          yield {
            type: 'delta_text',
            content: chunk.delta.text
          }
        }
  
        // console.log(chunk)
      }
  
      current = builder.done();  
          
    }

    // push `assistant` message into history
    params.history.push(
      {
        role: 'assistant',
        content: current.content
      }
    );

    if(callbacks?.onDone) {
      await callbacks.onDone(
        params.history.slice(1 + base_history_length)
      );
    }

  }
  
  
  /** @type {Impl["streamText"]} */
  streamText = async (params, callbacks) => {
    
    /** @type {ReadableStream<content>} */
    const stream = new ReadableStream(
      {
        start: async (controller) => {
          try {
            for await (const m of this.#_gen_text_generator(params, callbacks)) {
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
    let delta_messages = [];
    const { stream } = await this.streamText(
      params,
      {
        onDone: async (messages) => {
          delta_messages = messages;
        }
      }
    );

    const contents = await stream_accumulate(stream);

    return {
      contents,
      delta_messages
    };
  }


  /** @type {Impl["user_content_to_llm_user_message"]} */
  user_content_to_llm_user_message = (prompts) => {
    const prompts_filtered = prompts.filter(
      p => (p.type==='text' || p.type==='image')
    );

    return {
      role: 'user',
      content: prompts_filtered.map(
        (pr) => {
          if(pr.type==='text') {
            return (/** @satisfies {text_content} */({
              type: 'text',
              text: pr.content
            }))
          }
          
          if(pr.type==='image') {
            return (/** @satisfies {image_content} */({
              type: 'image',
              source: {
                data: pr.content, 
                media_type: 'image/png',
                type: 'base64'
              }
            }))
          }
        }
      )
    }
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
    
    throw new Error(
      "llm_assistant_message_to_user_content:: invalid data"
    );  
  };

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

