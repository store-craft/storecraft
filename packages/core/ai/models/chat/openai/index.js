/**
 * @import { config } from "./types.js";
 * @import { assistant_message,
 *  chat_completion_chunk_result, chat_completion_input, 
 *  chat_message, tool_message, user_message, 
 *  user_message_content_image_part, user_message_content_text_part
 * } from "./types.private.js";
 * @import { 
 *  content, GenerateTextParams, ChatAI
 * } from "../../../core/types.private.js";
 * @import { ENV } from '../../../../types.public.js';
 */

import { invoke_tool_safely } from "../../../core/tools.js";
import { zod_to_json_schema } from "../../../core/json-schema.js";
import { SSEGenerator } from "../../../core/sse.js";
import { content_stream_accumulate } from "../../../core/content-utils.js";
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
    this.config.api_key ??= 
      app.env[OpenAI.EnvConfig.api_key]; 
  }

  /**
   * @param {config} [config] 
   */
  constructor(config={}) {

    this.config = /** @type {config} */({
      model: 'gpt-4.1-mini',
      endpoint: 'https://api.openai.com/',
      api_version: 'v1',
      ...config,
    });

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
    return this.history_message_to_native_llm_messages(
      {
        role: 'user',
        contents: prompts
      }
    )?.at(0);
  };

  /** @type {Impl["history_message_to_native_llm_messages"]} */
  history_message_to_native_llm_messages = (message) => {

    const contents = message.contents;

    if(message.role==='user') {
      return [/** @type {user_message} */ ({
        role: 'user',
        content: contents.map(
          (c) => {
            switch(c.type) {
              case 'text':
                return /** @type {user_message_content_text_part} */ ({
                  type: 'text',
                  text: c.content
                })
              case 'image':
                return /** @type {user_message_content_image_part} */ ({
                  type: 'image_url',
                  image_url: {
                    url: c.content,
                    detail: 'auto'
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
      })]
    }

    if(message.role==='assistant') {
      // we will convert each content to OpenAI message format

      return contents.map(
        (content) => {
          switch(content.type) {
            case 'text':
              return /** @type {assistant_message} */ ({
                role: 'assistant',
                content: [
                  {
                    type: 'text',
                    text: content.content
                  }
                ]
              })
            case 'tool_use': {
              return /** @type {assistant_message} */ ({
                role: 'assistant',
                tool_calls: content.content.map(
                  (tc) => ({
                    id: tc.id,
                    type: 'function',
                    function: {
                      name: tc.name,
                      arguments: JSON.stringify(tc.arguments),
                    }
                  })
                )
              })
            }
            case 'tool_result': {
              return /** @type {tool_message} */ ({
                role: 'tool',
                tool_call_id: content.content.id,
                content: JSON.stringify(
                  content.content?.data ?? null
                )
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
   * @param {chat_message[]} messages
   * @param {GenerateTextParams["tools"]} tools
   * @param {boolean} [stream=false]
   */
  #text_complete = async (messages, tools, stream=false) => {

    const body = (/** @type {chat_completion_input} */
      ({
        model: this.config.model,
        messages,
        tools: tools && this.#to_native_tools(tools),
        stream,
        tool_choice: tools ? 'auto' : undefined
      })
    );

    // console.dir({
    //   messages: [...messages]
    // }, {depth: 10});

    const body_post_hook = this.config?.__hooks?.pre_request?.(
      body) ?? body;

    const result = await fetch(
      this.#chat_completion_url,
      {
        method: 'POST',
        body: JSON.stringify(body_post_hook),
        headers: {
          "Authorization" : `Bearer ${this.config.api_key}`,
          "Content-Type": "application/json"
        }
      }
    );

    // console.dir(await result.json(), {
    //   depth: 10
    // });

    // for await (const c of result.body) {
    //   console.log(new TextDecoder().decode(c))
    // }
    // throw 'tomer'

    // console.log(this.#chat_completion_url)
    // console.log(body)
    // console.log(result.ok)
    // throw 'stop'
    if(!result.ok) 
      throw (await result.text());
    
    return result;
  }

  /**
   * @param {chat_message[]} messages
   * @param {GenerateTextParams["tools"]} tools
   * @return {AsyncGenerator<chat_completion_chunk_result>}
   */
   async * #text_complete_stream(messages, tools) {

    const stream = await this.#text_complete(
      messages, tools, true
    );
  
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
   * @param {GenerateTextParams} params
   * @returns {AsyncGenerator<content>} 
   */
  async * #generator_completion(params) {
    let max_steps = params.maxSteps ?? 6;

    /** @type {chat_message[]} */
    const messages = [
      { // rewrite system prompt
        content: params.system,
        role: 'system'
      },

      // map history to OpenAI format
      ...(params.history ?? []).map(
        this.history_message_to_native_llm_messages
      ).flat(),

      // map current prompt to OpenAI format
      this.user_content_to_native_llm_user_message(
        params.prompt
      )
    ];

    let current_stream = this.#text_complete_stream(
      messages, params.tools
    );

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

    // console.dir(current, {
    //   depth: 10
    // });

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
            arguments: JSON.parse(tc.function.arguments),
            title: params.tools?.[tc.function.name].title
          })
        )
      }

      max_steps -= 1;

      // push `assistant` message into history
      messages.push(current.choices[0].message);

      // invoke tools
      for(const tool_call of current.choices[0].message.tool_calls) {

        // add tools results messages
        const tool_result = await invoke_tool_safely(
          params.tools[tool_call.function.name],
          JSON.parse(tool_call.function.arguments)
        );

        messages.push(
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
      current_stream = this.#text_complete_stream(
        messages, params.tools
      );
      
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
    messages.push(current.choices[0].message);
  }
  
  
  /** @type {Impl["streamText"]} */
  async streamText(params, callbacks) {
    
    /** @type {ReadableStream<content>} */
    const stream = new ReadableStream(
      {
        start: async (controller) => {
          try {
            /** @type {content[]} */
            const contents = [];
            for await (const m of this.#generator_completion(params)) {
              if(callbacks?.onDone)
                contents.push(m);

              // console.dir({m}, {
              //   depth: 10
              // });

              controller.enqueue(m);
            }

            if(callbacks?.onDone) {
              await callbacks.onDone(
                contents
              );
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
    const { stream } = await this.streamText(
      params,
    );

    const contents = await content_stream_accumulate(stream);

    return {
      contents
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

