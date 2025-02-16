/**
 * @import { 
chat_completion_chunk_result,
 *  chat_completion_input, chat_completion_result, chat_message, config 
 * } from "./types.js";
 * @import { AI, content, GenerateTextParams, GenerateTextResponse } from "../types.private.js";
 */

import { invoke_tool_safely } from "../index.js";
import { zod_to_json_schema } from "../json-schema.js";
import { SSEGenerator } from "../sse.js";


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
   * @return {Promise<ReadableStream>}
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

    if(false) {
      for await(const chunk of result.body) {
        console.log(new TextDecoder().decode(chunk), '\n\n\n')
      }
    }

    if(!result.ok) 
      throw (await result.text())
    
    return result.body;
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @return {AsyncGenerator<chat_completion_chunk_result>}
   */
  #text_complete_stream = async function *(params) {

    const stream = await this.#text_complete(params, true)
  
    for await (const frame of SSEGenerator(stream)) {
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

    /**
     * 
     */
    const message_builder = () => {
      /** @type {chat_completion_result} */
      let final;

      return {
        /** @param {chat_completion_chunk_result} delta */
        add_delta: (delta) => {
          if(!Boolean(delta))
            return;

          if(!Boolean(final)) {
            final = {
              created: delta.created,
              id: delta.id,
              model: delta.model,
              system_fingerprint: delta.system_fingerprint,
              object: 'chat.completion',
              usage: delta.usage,
              choices: [
                {
                  finish_reason: delta.choices[0].finish_reason,
                  index: delta.choices[0].index,
                  logprobs: delta.choices[0].logprobs,
                  message: delta.choices[0].delta
                }
              ], 
            };

            return;
          }

          const d_choice = delta.choices?.[0];

          if(d_choice?.finish_reason)
            final.choices[0].finish_reason = d_choice.finish_reason;

          if(d_choice?.delta?.content) {
            final.choices[0].message.content = (final.choices[0].message.content ?? '') + 
            d_choice.delta.content;
          }
          
          if(d_choice?.delta?.refusal)
            final.choices[0].message.refusal = d_choice.delta.refusal;

          if(d_choice?.delta?.tool_calls) {
            if(!final.choices[0].message.tool_calls) {
              final.choices[0].message.tool_calls = d_choice.delta.tool_calls;
            } else {
              final.choices[0].message.tool_calls.forEach(
                (tc, ix) => {
                  tc.function.arguments += d_choice.delta.tool_calls[ix].function.arguments;
                }
              );
            }
          }

        },
        done: () => final
      }
    }

    const builder = message_builder();
    
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
            name: tc.function.name
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
          content: tool_result
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
      
      const builder = message_builder();
    
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

    /** @type {GenerateTextResponse} */
    const contents = {
      contents: []
    }

    /** @type {content[]} */
    const text_deltas = [];

    const { stream } = await this.streamText(params);

    for await(const update of stream) {
      if(update.type==='delta_text')
        text_deltas.push(update);
      else
        contents.contents.push(update);
    }

    // reduce text deltas
    const reduced_text_content = text_deltas.reduce(
      (p, update) => {
        p.content += update.content;

        return p;
      }, {
        content: '',
        type: 'text'
      }
    );

    contents.contents.push(reduced_text_content);

    return contents;
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

