export * from './index.js';

export type config = {
  model?: (
    'claude-3-5-sonnet-20241022' | 
    'claude-3-5-haiku-20241022' | 
    'claude-3-haiku-20240307' | 
    'claude-3-opus-20240229') | ({} & string),
  api_version?: string = "v1";
  anthropic_version?: string = "2023-06-01";
  api_key: string
}


export type with_cache_control = {
  cache_control?: {type: 'ephemeral'}
}

export type general_claude_tool = {
  /** JSON schema for this tool's input. This defines the shape of the input that your tool accepts and that the model will produce. */
  input_schema: {
    type: 'object',
    properties?: object
  },
  /** Name of the tool. This is how the tool will be called by the model and in tool_use blocks. */
  name: string;
  /** Description of what this tool does. Tool descriptions should be as detailed as possible. The more information that the model has about what the tool is and how to use it, the better it will perform. You can use natural language descriptions to reinforce important aspects of the tool input JSON schema. */
  description?: string;
  type?: 'custom',
} & with_cache_control;

export type text_content = {
  text: string
  type: 'text'
}

export type tool_use_content = {
  id: string
  input: object
  name: string
  type: 'tool_use'
}

export type tool_result_content = {
  tool_use_id: string
  type: 'tool_result'
  is_error?: boolean
  content: string | text_content | image_content
}


export type image_content = {
  source: {
    data: string;
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
    type: 'base64'
  }
  type: 'image'
}


export type claude_message = {
  content: string | ((text_content | image_content | tool_use_content | tool_result_content) & with_cache_control)[];
  role: 'user' | 'assistant'
}

export type chat_completion_input = {

  /** The maximum number of tokens to generate before stopping. Note that our models may stop before reaching this maximum. This parameter only specifies the absolute maximum number of tokens to generate. Different models have different maximum values for this parameter. See models for details. */
  max_tokens: number;

  /** The model that will complete your prompt. */
  model: string;

  messages: claude_message[];

  /** An object describing metadata about the request. */
  metadata?: {
    /** An external identifier for the user who is associated with the request. This should be a uuid, hash value, or other opaque identifier. Anthropic may use this id to help detect abuse. Do not include any identifying information such as name, email address, or phone number. */
    user_id?; string;
  }

  /** Custom text sequences that will cause the model to stop generating. Our models will normally stop when they have naturally completed their turn, which will result in a response stop_reason of "end_turn". If you want the model to stop generating when it encounters custom strings of text, you can use the stop_sequences parameter. If the model encounters one of the custom sequences, the response stop_reason value will be "stop_sequence" and the response stop_sequence value will contain the matched stop sequence. */
  stop_sequences?: string[];

  /** Whether to incrementally stream the response using server-sent events. */
  stream?: boolean;

  /** A system prompt is a way of providing context and instructions to Claude, such as specifying a particular goal or role. See our guide to system prompts. */
  system?: string;

  /** Amount of randomness injected into the response. Defaults to 1.0. Ranges from 0.0 to 1.0. Use temperature closer to 0.0 for analytical / multiple choice, and closer to 1.0 for creative and generative tasks. Note that even with temperature of 0.0, the results will not be fully deterministic. */
  temperature?: number;

  /** How the model should use the provided tools. The model can use a specific tool, any available tool, or decide by itself. */
  tool_choice?: ({
    type: 'auto' | 'any',
  } | {
    type: 'tool',
    /** The name of the tool to use. */
    name: string
  }) & {
    /** Whether to disable parallel tool use. Defaults to false. If set to true, the model will output at most one tool use. */
    disable_parallel_tool_use?: boolean;
  }

  /** Tools can be used for workflows that include running client-side tools and functions, or more generally whenever you want the model to produce a particular JSON structure of output. */
  tools?: general_claude_tool[]

  /** Only sample from the top K options for each subsequent token. Used to remove "long tail" low probability responses. Learn more technical details here. Recommended for advanced use cases only. You usually only need to use temperature.*/
  top_k?: number;


  /** Use nucleus sampling. In nucleus sampling, we compute the cumulative distribution over all the options for each subsequent token in decreasing probability order and cut it off once it reaches a particular probability specified by top_p. You should either alter temperature or top_p, but not both. Recommended for advanced use cases only. You usually only need to use temperature.*/
  top_p?: number;

}


export type claude_completion_response = {

  /** Content generated by the model. This is an array of content blocks, each of which has a type that determines its shape. */
  content: (text_content | tool_use_content)[];

  /** Unique object identifier. */
  id: string;

  /** The model that handled the request. */
  model: string;

  role: 'assistant',

  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use" | null;

  /** Which custom stop sequence was generated, if any. This value will be a non-null string if one of your custom stop sequences was generated. */
  stop_sequence: string | null;

  type: 'message';
  usage: {
    /** The number of input tokens used to create the cache entry. */
    cache_creation_input_tokens: number | null;

    /** The number of input tokens read from the cache. */
    cache_read_input_tokens: number | null;

    /** The number of input tokens which were used. */
    input_tokens: number;

    /** The number of output tokens which were used. */
    output_tokens: number;
  }
}

// streaming

export type stream_event_error = {
  type: 'error',
  error: {
    type: string, 
    message: string
  }
}

export type stream_event_ping = {
  type: 'ping',
}

export type Pick<H> = H extends (infer F)[] ? F : never;

export type stream_event_content_block_start = {
  type: "content_block_start",
  index: number,
  content_block: Partial<text_content | tool_use_content>
}

export type stream_event_content_block_delta = {
  type: "content_block_delta",
  index: number,
  delta: {
    type: "text_delta", 
    text: string
  } | {
    type: "input_json_delta", 
    partial_json: string
  }
}

export type stream_event_content_block_stop = {
  type: "content_block_stop",
  index: number,
}


export type stream_event_message_start = {
  type: "message_start",
  message: Partial<claude_completion_response>
}

export type stream_event_message_delta = {
  type: "message_delta",
  delta: Partial<claude_completion_response>
}

export type stream_event_message_stop = {
  type: "message_stop",
}

export type stream_event = |
      stream_event_message_stop |
      stream_event_message_delta |
      stream_event_message_start | 
      stream_event_content_block_stop | 
      stream_event_content_block_delta | 
      stream_event_content_block_start |
      stream_event_ping | stream_event_error;