/**
 * @import { config } from "./types.js";
 * @import { 
 *  chat_completion_input, claude_message, stream_event, 
 *  claude_message_text_content, claude_message_image_content, 
 *  claude_message_tool_use_content, claude_message_tool_result_content,
 * } from "./types.private.js";
 * @import { 
 *  ChatAI, content, GenerateTextParams, 
 * } from "../../../core/types.private.js";
 * @import { ENV } from '../../../../types.public.js';
 */
import { invoke_tool_safely } from "../../../core/tools.js";
import { zod_to_json_schema } from "../../../core/json-schema.js";
import { SSEGenerator } from "../../../core/sse.js";
import { content_stream_accumulate } from "../../../core/content-utils.js";
import { stream_message_builder } from "./stream-message-builder.js";

/**
 * @typedef {ChatAI<config, claude_message>} Impl
 */


/**
 * @implements {Impl}
 */
export class Anthropic {

  /** @satisfies {ENV<config>} */
  static EnvConfig = /** @type{const} */ ({
    api_key: 'ANTHROPIC_API_KEY'
  });

  #chat_completion_url = '';
  #chat_models_url = '';
  #anthropic_endpoint = 'https://api.anthropic.com'

  /**
   * @param {config} config 
   */
  constructor(config) {
    this.config = /** @type {config} */({
      model: 'claude-3-5-sonnet-20241022',
      api_version: 'v1',
      anthropic_version: "2023-06-01",
      ...config,
    })

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
    this.config.api_key ??= 
      app.env[Anthropic.EnvConfig.api_key]; 
  }

  /**
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
   * @param {claude_message[]} messages
   * @param {boolean} [stream=false]
   */
  #text_complete = async (params, messages, stream) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages: messages,
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
   * @param {claude_message[]} messages
   * @return {AsyncGenerator<stream_event>}
   */
  async * #text_complete_stream(params, messages) {

    const stream = await this.#text_complete(params, messages, true);
  
    for await (const frame of SSEGenerator(stream.body)) {
      // console.log(frame);
      yield JSON.parse(frame.data);
    }
  }

  /**
   * @param {GenerateTextParams} params
   * @returns {AsyncGenerator<content>} 
   */
  async * generator_completion(params) {
    let max_steps = params.maxSteps ?? 6;
    const base_history_length = params.history.length;

    /** @type {claude_message[]} */
    const messages = [
      // map history to claude format
      ...(params.history ?? []).map(
        this.history_message_to_native_llm_messages
      ).flat(),

      // map current prompt to claude format
      this.user_content_to_native_llm_user_message(
        params.prompt
      )
    ];

    let current_stream = this.#text_complete_stream(params, messages);

    const builder = stream_message_builder();
    
    for await (const chunk of current_stream) {
      builder.add_chunk(chunk);

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
            arguments: tc.input,
            id: tc.id,
            title: params.tools?.[tc.name].title
          })
        )
      }

      max_steps -= 1;

      // push `assistant` message into history
      messages.push(
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

        messages.push(
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

        yield {
          type: 'tool_result',
          content: {
            data: tool_result,
            id: tool_call.id,
            name: tool_call.name
          }
        }
      }

      // again
      current_stream = this.#text_complete_stream(params, messages);
      
      const builder = stream_message_builder();
    
      for await (const chunk of current_stream) {
        builder.add_chunk(chunk);
  
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
    messages.push({
      role: 'assistant',
      content: current.content
    });

  }
  
  
  /** @type {Impl["streamText"]} */
  streamText = async (params, callbacks) => {
    
    /** @type {ReadableStream<content>} */
    const stream = new ReadableStream(
      {
        start: async (controller) => {
          try {
            /** @type {content[]} */
            const contents = [];
            for await (const m of this.generator_completion(params)) {
              if(callbacks?.onDone) {
                contents.push(m);
              }

              controller.enqueue(m);
            }

            if(callbacks?.onDone) {
              await callbacks.onDone(
                contents
              );
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
   * @type {Impl["generateText"]} 
   */
  generateText = async (params) => {
    const { stream } = await this.streamText(
      params,
    );

    const contents = await content_stream_accumulate(stream);

    return {
      contents
    };
  }

  /** @type {Impl["history_message_to_native_llm_messages"]} */
  history_message_to_native_llm_messages = (message) => {

    const contents = message.contents;

    if(message.role==='user') {
      return [{
        role: 'user',
        content: contents.map(
          (c) => {
            switch(c.type) {
              case 'text':
                return /** @type {claude_message_text_content} */ ({
                  type: 'text',
                  text: c.content
                })
              case 'image':
                return /** @type {claude_message_image_content} */ ({
                  type: 'image',
                  source: {
                    data: c.content,
                    media_type: 'image/png',
                    type: 'base64'
                  }
                })
              default:
                console.log(
                  `unsupported user content type ${c.type}`
                );
                return undefined;
            }
          }
        ).filter(Boolean)
      }]
    }

    if(message.role==='assistant') {
      // we will convert each content to OpenAI message format

      return contents.map(
        (content) => {
          switch(content.type) {
            case 'text':
              return /** @type {claude_message} */ ({
                role: 'assistant',
                content: [
                  {
                    type: 'text',
                    text: content.content
                  }
                ]
              })
            case 'tool_use': {
              return /** @type {claude_message} */ ({
                role: 'assistant',
                content: content.content.map(
                  (tc) => /** @type {claude_message_tool_use_content} */ ({
                    type: 'tool_use',
                    id: tc.id,
                    name: tc.name,
                    input: tc.arguments,
                  })
                )
              })
            }
            case 'tool_result': {
              return /** @type {claude_message} */ ({
                role: 'user',
                content: [/** @type {claude_message_tool_result_content} */ ({
                  type: 'tool_result',
                  tool_use_id: content.content.id,
                  content: JSON.stringify(content.content.data)
                })]
              })
            }
            default: {
              console.log(
                `unsupported assistant content type ${content.type}`
              );
              return undefined;
            }
          }
        }
      ).filter(Boolean)
    }
  }
      

  /** @type {Impl["user_content_to_native_llm_user_message"]} */
  user_content_to_native_llm_user_message = (prompts) => {
    const prompts_filtered = prompts.filter(
      p => (p.type==='text' || p.type==='image')
    );

    return {
      role: 'user',
      content: prompts_filtered.map(
        (pr) => {
          if(pr.type==='text') {
            return (/** @satisfies {claude_message_text_content} */({
              type: 'text',
              text: pr.content
            }))
          }
          
          if(pr.type==='image') {
            return (/** @satisfies {claude_message_image_content} */({
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

