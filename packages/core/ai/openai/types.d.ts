
export type config = {
  model?: ('o1-mini' | 'gpt-4o' | 'gpt-4' | 'gpt-4o-mini' | 'gpt-4-turbo') | ({} & string),
  endpoint?: string,
  api_version?: string;
  api_key: string
}

export type general_chat_completion_message = {
  content: string;
  role: 'user' | 'developer' | 'system' | 'assistant';
  name?: string;
}

export type tool_chat_completion_message = {
  content: string;
  role: 'tool';
  /** Tool call that this message is responding to. **/
  tool_call_id: string;
}

export type chat_completion_input = {
  /**
   * @description ID of the model to use. See the model endpoint compatibility table for details on which models work with the Chat API.
   */
  model: string;
  /**
   * @description A list of messages comprising the conversation so far. Depending on the model you use, different message types (modalities) are supported, like text, images, and audio.
   */
  messages: (general_chat_completion_message | tool_chat_completion_message)[];

  /** 
   * @description An upper bound for the number of tokens that can be generated 
   * for a completion, including visible output tokens and reasoning tokens. 
   */
  max_completion_tokens?: number;

  /**
   * @description How many chat completion choices to generate for each input message. 
   * Note that you will be charged based on the number of generated tokens across all 
   * of the choices. Keep `n` as `1` to minimize costs.
   */
  n?: number;

  /**
   * @description A list of tools the model may call. Currently, only functions 
   * are supported as a tool. Use this to provide a list of functions the model 
   * may generate JSON inputs for. A max of 128 functions are supported.
   */
  tools?: {
    /**
     * @description The type of the tool. Currently, only function is supported.
     */
    type: 'function' | string;
    function: {
      /**
       * @description The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
       */
      name?: string;
      /**
       * @description The parameters the functions accepts, described as a JSON Schema object. 
       * See the [guide](https://platform.openai.com/docs/guides/function-calling) 
       * for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/reference/object) 
       * for documentation about the format.
       */
      parameters?: object;
      /**
       * @description A description of what the function does, used by the model to choose when and how to call the function.
       */
      description: string;
    }
  }[];

  /**
   * @description Controls which (if any) tool is called by the model. none means the 
   * model will not call any tool and instead generates a message. auto means the 
   * model can pick between generating a message or calling one or more tools. 
   * required means the model must call one or more tools. Specifying a particular 
   * tool via {"type": "function", "function": {"name": "my_function"}} forces the 
   * model to call that tool.
   * `none` is the default when no tools are present. `auto` is the default if tools 
   * are present.
   */
  tool_choice?: 'none' | 'auto' | {
    /** The type of the tool. Currently, only function is supported. */
    type: string;
    function: {
      /** The name of the function to call. */
      name: string;
    }

  };

  /**
   * @description An object specifying the format that the model must output.
   * Setting to `{ "type": "json_schema", "json_schema": {...} }` enables Structured Outputs 
   * which ensures the model will match your supplied JSON schema. Learn more in the 
   * [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs).
   * 
   * Setting to `{ "type": "json_object" }` enables JSON mode, which ensures the message 
   * the model generates is valid JSON.
   * 
   * Important: when using JSON mode, you must also instruct the model to produce JSON yourself 
   * via a system or user message. Without this, the model may generate an unending stream of 
   * whitespace until the generation reaches the token limit, resulting in a long-running 
   * and seemingly "stuck" request. Also note that the message content may be partially 
   * cut off if `finish_reason="length"`, which indicates the generation exceeded `max_tokens` 
   * or the conversation exceeded the max context length.
   */
  response_format?: {
    /** The type of response format being defined: `text` */
    type: 'text';
  } | {
    /** The type of response format being defined: `json_object` */
    type: 'json_object';
  } | {
    /** The type of response format being defined: `json_schema` */
    type: 'json_schema';
    /** A description of what the response format is for, used by the model to determine how to respond in the format. */
    description?: string;
    /** The name of the response format. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64. */
    name: string;
    /** The schema for the response format, described as a JSON Schema object. */
    schema: object;
    /**
     * @description Whether to enable strict schema adherence when generating the output. 
     * If set to true, the model will always follow the exact schema defined in the 
     * schema field. Only a subset of JSON Schema is supported when strict is true. 
     * To learn more, read the [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs).
     */
    strict?: boolean;
  }

  /** Up to 4 sequences where the API will stop generating further tokens. */
  stop?: string | string[] | null;

  /** 
   * @description If set, partial message deltas will be sent, like in ChatGPT. 
   * Tokens will be sent as data-only server-sent events as they become available, 
   * with the stream terminated by a data: [DONE] message. 
   * [Example Python Code](https://cookbook.openai.com/examples/how_to_stream_completions)
   */
  stream?: boolean;

  /**
   * @description What sampling temperature to use, between 0 and 2. Higher values 
   * like 0.8 will make the output more random, while lower values like 0.2 will 
   * make it more focused and deterministic. We generally recommend altering this 
   * or top_p but not both.
   */
  temperature?: number;

  /**
   * @description An alternative to sampling with temperature, called nucleus sampling,
   * where the model considers the results of the tokens with `top_p` probability mass. 
   * So `0.1` means only the tokens comprising the top 10% probability mass are considered. 
   * We generally recommend altering this or temperature but not both.
   * 
   * @default 1
   */
  top_p?: number;
}


export type chat_completion_result = {
  /** A unique identifier for the chat completion. */
  id: string;
  /** The Unix timestamp (in seconds) of when the chat completion was created.   */
  created: number;
  /** The model used for the chat completion. */
  model: string;
  /** A list of chat completion choices. Can be more than one if n is greater than 1. */
  choices: {
    /** The index of the choice in the list of choices. */
    index: number;
    /** A chat completion message generated by the model. */
    message: {
      content: string | null;
      refusal: string | null;
      /**
       * @description The reason the model stopped generating tokens. 
       * This will be
       * - `stop` if the model hit a natural stop point or a provided stop sequence, 
       * - `length` if the maximum number of tokens specified in the request was reached, 
       * - `content_filter` if content was omitted due to a flag from our content filters, 
       * - `tool_calls` if the model called a tool, or 
       * - `function_call` (deprecated) if the model called a function.       
       */
      finish_reason: 'stop'| 'length' | 'content_filter' | 'tool_calls'
      /** The role of the author of this message. */
      role: string;
      /** The tool calls generated by the model, such as function calls. */
      tool_calls: {
        /** The ID of the tool call. */
        id: string;
        /** The type of the tool. Currently, only function is supported */
        type: string;
        /** The function that the model called. */
        function: {
          /** The name of the function to call. */
          name: string;
          /**
           * @description The arguments to call the function with, as generated by 
           * the model in JSON format. Note that the model does not always generate 
           * valid JSON, and may hallucinate parameters not defined by your 
           * function schema. Validate the arguments in your code before calling 
           * your function.
           */
          arguments: string;
        }
      }[]

    }
  }[];

  /** The object type, which is always `chat.completion` */
  object: string;

}



export type chat_completion_chunk_result = {
  /** A unique identifier for the chat completion. */
  id: string;
  /** The Unix timestamp (in seconds) of when the chat completion was created.   */
  created: number;
  /** The model used for the chat completion. */
  model: string;
  /** A list of chat completion choices. Can be more than one if n is greater than 1. */
  choices: {
    /** The index of the choice in the list of choices. */
    index: number;
    /** A chat completion delta generated by streamed model responses. */
    delta: {
      /** The contents of the chunk message. */
      content: string | null;
      refusal: string | null;
      /**
       * @description The reason the model stopped generating tokens. 
       * This will be
       * - `stop` if the model hit a natural stop point or a provided stop sequence, 
       * - `length` if the maximum number of tokens specified in the request was reached, 
       * - `content_filter` if content was omitted due to a flag from our content filters, 
       * - `tool_calls` if the model called a tool, or 
       * - `function_call` (deprecated) if the model called a function.       
       */
      finish_reason: 'stop'| 'length' | 'content_filter' | 'tool_calls'
      
      /** The role of the author of this message. */
      role: string;
      /** The tool calls generated by the model, such as function calls. */
      tool_calls: {
        /** The ID of the tool call. */
        id: string;
        /** The type of the tool. Currently, only function is supported */
        type: string;
        /** The function that the model called. */
        function: {
          /** The name of the function to call. */
          name: string;
          /**
           * @description The arguments to call the function with, as generated by 
           * the model in JSON format. Note that the model does not always generate 
           * valid JSON, and may hallucinate parameters not defined by your 
           * function schema. Validate the arguments in your code before calling 
           * your function.
           */
          arguments: string;
        }
      }[]

    }
  }[];

  /** The object type, which is always `chat.completion.chunk` */
  object: string;
}

