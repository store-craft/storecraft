/**
 * @import { config } from "./types.js";
 * @import { 
 *  chat_completion_chunk_result, chat_completion_input, 
 *  chat_message 
 * } from "./types.private.js";
 * @import { 
 *  content, content_text, GenerateTextParams, StreamTextCallbacks, ChatAI
 * } from "../../../core/types.private.js";
 * @import { ENV } from '../../../../types.public.js';
 */

import { invoke_tool_safely } from "../../../core/tools.js";
import { zod_to_json_schema } from "../../../core/json-schema.js";
import { SSEGenerator } from "../../../core/sse.js";
import { stream_accumulate } from "../../../core/stream-accumulate.js";
import { stream_message_builder } from "./stream-message-builder.js";

/**
 * @typedef {ChatAI<config, chat_message>} Impl
 */

const strip_leading = (text = '') => {
  return (text[0]==='/') ? text.slice(1) : text;
}


/**
 * @implements {Impl}
 */
export class OpenAI { 

  /** @satisfies {ENV<config>} */
  static EnvConfig = /** @type{const} */ ({
    api_key: 'OPENAI_API_KEY'
  });

  #chat_completion_url = '';
  #chat_models_url = '';

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[OpenAI.EnvConfig.api_key]; 
  }

  /**
   * @param {config} [config] 
   */
  constructor(config={}) {
    this.config = {
      ...config,
      model: config.model ?? 'gpt-4o',
      endpoint: config.endpoint ?? 'https://api.openai.com/',
      api_version: config.api_version ?? 'v1'
    }

    this.#chat_completion_url = new URL(
      strip_leading(this.config.api_version + '/chat/completions'), 
      this.config.endpoint
    ).toString();

    this.#chat_models_url = new URL(
      strip_leading(this.config.api_version + '/models'), 
      this.config.endpoint
    ).toString();
  }


  /** @type {Impl["user_content_to_native_llm_user_message"]} */
  user_content_to_native_llm_user_message = (prompts) => {
    const prompts_filtered = prompts.filter(
      p => (p.type==='text' || p.type==='image')
    );

    return {
      role: 'user',
      content: prompts_filtered.map(
        (pr) => (

          (pr.type==='text') ? { 
            type: 'text', text: pr.content 
          } : {
            type: 'image_url',
            image_url: {
              url: pr.content,
              detail: 'auto'
            }
          }
        )
      )
    }
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
            description: tool.description,
            name: name,
            parameters: tool.schema && zod_to_json_schema(tool.schema),
            strict: true
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

    // for await (const c of result.body) {
    //   console.log(new TextDecoder().decode(c))
    // }

    // console.log(this.#chat_completion_url)
    // console.log(body)
    // console.log(result.ok)
    // throw 'stop'
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
      // console.log(frame);

      if(!frame.data)
        continue;
      
      if(frame.data.trim()==='[DONE]')
        continue;

      yield JSON.parse(frame.data);
    }
  }

  /**
   * 
   * @param {GenerateTextParams<chat_message>} params
   * @param {StreamTextCallbacks<chat_message>} [callbacks]
   * @returns {AsyncGenerator<content>} 
   */
  async * #_gen_text_generator(params, callbacks) {
    let max_steps = params.maxSteps ?? 6;

    const base_history_length = params.history.length;
    params.history = [
      { // rewrite system prompt
        content: params.system,
        role: 'system'
      },
      ...(params.history ?? [])?.filter(m => m.role!=='system'),
      this.user_content_to_native_llm_user_message(params.prompt)
    ];

    let current_stream = this.#text_complete_stream(params);

    const builder = stream_message_builder();
    
    for await (const chunk of current_stream) {
      // console.log({chunk: JSON.stringify(chunk, null, 2)});
      builder.add_chunk(chunk);

      if(chunk?.choices?.[0].delta.content) {
        yield {
          type: 'delta_text',
          content: chunk.choices[0].delta.content
        }
      }
    }

    let current = builder.done();

    // while we are at a tool call, we iterate internally
    while(
      (
        current.choices?.[0].finish_reason === 'tool_calls' || 
        current.choices?.[0].message?.tool_calls?.length > 0
      ) &&
      (max_steps > 0)
    ) {

      yield {
        type: 'tool_use',
        content: current.choices[0].message.tool_calls.map(
          tc => ({
            name: tc.function.name,
            id: tc.id,
            arguments: tc.function.arguments,
            title: params.tools?.[tc.function.name].title
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

        params.history.push(
          {
            role: 'tool',
            tool_call_id: tool_call.id,
            content: JSON.stringify(
              tool_result
            )
          }
        );

        // console.log('tool result', tool_result)
        yield {
          type: 'tool_result',
          content: {
            data: tool_result,
            id: tool_call.id,
            name: tool_call.function.name
          }
        }        
      }

      // again
      current_stream = this.#text_complete_stream(params);
      
      const builder = stream_message_builder();
    
      for await (const chunk of current_stream) {
        builder.add_chunk(chunk);
  
        if(chunk?.choices[0].delta.content) {
          yield {
            type: 'delta_text',
            content: chunk.choices[0].delta.content
          }
        }
      }
  
      current = builder.done();  
    }
    
    // push `assistant` message into history
    params.history.push(current.choices[0].message);

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
            console.log(e)
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
  
  /** @type {Impl["generateText"]} */
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

