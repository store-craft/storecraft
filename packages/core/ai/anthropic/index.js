/**
 * @import { 
 *  chat_completion_input, claude_completion_response,
 *  config, claude_message,
 stream_event,
 text_content,
 tool_use_content
 * } from "./types.js";
 * @import { AI, content, GenerateTextParams, GenerateTextResponse } from "../types.private.js";
 */

import { invoke_tool_safely } from "../index.js";
import { zod_to_json_schema } from "../json-schema.js";
import { SSEGenerator } from "../sse.js";

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

    return result.body;
  }

  /**
   * @param {Impl["__gen_text_params_type"]} params
   * @return {AsyncGenerator<stream_event>}
   */
  async * #text_complete_stream(params) {

    const stream = await this.#text_complete(params, true);
  
    for await (const frame of SSEGenerator(stream)) {
      // console.log(frame);
      yield JSON.parse(frame.data);
    }
  }

  /**
   * 
   * @param {GenerateTextParams<claude_message>} params
   * @returns {AsyncGenerator<content>} 
   */
  async * #_gen_text_generator(params) {
    let max_steps = params.maxSteps ?? 6;

    params.history = [
      ...(params.history ?? []),
      ...this.user_content_to_llm_user_message(params.prompt)
    ];

    let current_stream = this.#text_complete_stream(params);

    /**
     * 
     */
    const message_builder = () => {
      /** @type {claude_completion_response} */
      let final;

      return {
        /** @param {stream_event} delta */
        add_delta: (delta) => {
          if(delta.type==='message_start') {
            final = {...delta.message};
          } else if(delta.type==='message_delta') {
            final = {...final, ...delta.delta};
          } else if(delta.type==='error') {
            console.log('Anthropic::add_delta ', delta);
            throw delta.error;
          } else if(delta.type==='content_block_start') {
            final.content[delta.index] = delta.content_block;
          } else if(delta.type==='content_block_delta') {
            if(delta.delta.type==='text_delta') {
              const c = (/** @type {text_content} */ (final.content[delta.index]));
              final.content[delta.index] = {
                ...c,
                text: c.text + delta.delta.text
              } ;
            } else if(delta.delta.type==='input_json_delta') {
              const c = (/** @type {tool_use_content} */ (final.content[delta.index]));
              final.content[delta.index] = {
                ...c,
                __partial_json: (c.__partial_json ?? '') + delta.delta.partial_json,
              } ;
            }
          } else if(delta.type==='content_block_stop') {
            const c = final.content[delta.index];
            // Parse accumulated JSON string into object to conform with
            // the type
            if(c.type==='tool_use') {
              c.input = JSON.parse(c.__partial_json);
              delete c['__partial_json']
            }

          } else {
            //ignore other events
          }

        },
        done: () => final
      }
    }

    const builder = message_builder();
    
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

    /** @type {content[]} */
    let contents = [];

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
            id: tc.id
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
            id: tool_call.id
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
      
      const builder = message_builder();
    
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

    return {
      contents: this.llm_assistant_message_to_user_content(
        current
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
    
    throw new Error(
      "llm_assistant_message_to_user_content:: invalid data"
    );  
  };


  /**
   * 
   * @type {Impl["generateText"]} 
   */
  generateText_OLD = async (params) => {

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

