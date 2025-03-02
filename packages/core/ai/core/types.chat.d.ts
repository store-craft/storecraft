import { z } from 'zod';
import { tool } from './index.js';
import { App } from '../../types.public.js';

export type InferToolInputSchema<TOOL extends Tool> = TOOL extends Tool<infer I, infer O> ? z.infer<I> : never;
export type InferToolReturnSchema<TOOL extends Tool> = TOOL extends Tool<infer I, infer O> ? z.infer<O> : never;

/**
 * @description General Tool specification
 */
export type Tool<
  ToolInput extends z.ZodTypeAny=any,
  ToolResult extends z.ZodTypeAny = any,
  > = {
    __TOOL_INPUT_SCHEMA_TYPE?: ToolInput,
    __TOOL_RESULT_SCHEMA_TYPE?: ToolResult,

    /**
     * @description Short title about this tool
     */
    title: string,

    /**
     * @description Full description of this tool
     */
    description: string,

    /**
     * @description `zod` schema for the parameters of the tool
     */
    schema: ToolInput,

    /**
     * @description Optional result type of tool
     */
    schema_result?:  ToolResult,

    /**
     * @description Invoke / Use the tool
     * 
     * @param input `zod` schema
     * @returns 
     */
    use: (input: z.infer<ToolInput>) => Promise<Partial<z.infer<ToolResult>>>;
  }


export type content_text = { type: 'text', content: string };
export type content_delta_text = { type: 'delta_text' | 'delta_text', content: string };
export type content_tool_use = { type: 'tool_use', content: { name?: string, title?: string, id?: string }[] };
export type content_tool_result<T extends any = any> = { 
  type: 'tool_result', 
  content: { 
    data: { result: T} | { error: any }, 
    id?: string, 
    name: string 
  } 
};
export type content_image = { type: 'image', content: string };
export type content_json = { type: 'json', content: string };
export type content_object = { type: 'object', content: Object };
export type content_error = { type: 'error', content: { code?: string, message?: string} | string};

/** @description A general content type from and to user */
export type content = | content_text | content_delta_text 
                      | content_tool_use | content_tool_result 
                      | content_image | content_json | content_object
                      | content_error;



/**
 * @description Text generation parameters
 */
export type GenerateTextParams<MessageType extends any = any> = {
  /**
   * @description tools
   */
  tools?: Record<string, Tool>,
  /**
   * @description System prompt
   */
  system?: string;
  /**
   * @description history native messages specific to the LLM
   */
  history: MessageType[],
  /**
   * @description A user prompt in generic form, later will be translated into LLM specific message
   */
  prompt: content[],
  /**
   * @description Max tokens
   */
  maxTokens?: number
  /**
   * @description The maximum amount of steps to iterate
   */
  maxSteps?: number
}

/**
 * @description Content response from the LLM in a unified structure
 */
export type GenerateTextResponse<LLMMessageType extends any = any> = {
  /**
   * @description Formatted response contents, including text, tool usage etc..
   */
  contents?: content[],
  /**
   * @description Native LLM messages, that were generated during the generation process,
   * we report it for saving purposes of the history
   */
  delta_messages?: LLMMessageType[]
}

/**
 * @description Content response from the LLM in a unified structure
 */
export type StreamTextResponse = {
  stream: ReadableStream<content>
}

/**
 * @description Callbacks related to streaming async nature
 */
export type StreamTextCallbacks<LLMMessageType extends any = any> = {
  /**
   * 
   * @param delta_messages **LLM** messages, that were generated during the generation
   */
  onDone?: (delta_messages: LLMMessageType[]) => Promise<any> | void
}

/**
 * @description **AI** Provider interface for text completion
 * @template Config config type
 * @template LLMMessageType Native LLM message type
 */
export interface ChatAI<
  Config extends any = any, 
  LLMMessageType extends any = any
  > {
  
  __message_type?: LLMMessageType;
  __gen_text_params_type?: GenerateTextParams<LLMMessageType>;

  config?: Config;

  /**
   * @description The purpose of this method is to generate new {@link content} 
   * array based on,
   *  
   * #### 1. LLM history
   * Which Array of native LLM specific messages
   * 
   * #### 2. User prompt
   * Which is a simple array of {@link content}, such as
   * 
   * ```js
   * [{ type:'text', content: 'user prompt'}, { type:'image', content: 'base64_****'}]
   * ```
   * #### 3. Tools
   * A dictionary of {@link Tool}. Each has schema typed with `zod`. 
   * Be sure to use the {@link tool} helper
   * fot extra type safety
   * 
   * #### 4. Return content
   * Each generation returns an array of regular {@link content} simple as
   * ```js
   * [{ type:'text', content: 'LLM response'}]
   * ```
   * 
   * @param params params
   */
  generateText: (
    params: GenerateTextParams<LLMMessageType>
  ) => Promise<GenerateTextResponse<LLMMessageType>>;
  streamText?: (
    params: GenerateTextParams<LLMMessageType>,
    callbacks?: StreamTextCallbacks<LLMMessageType>
  ) => Promise<StreamTextResponse>

  /**
   * @description Translate a generic user prompt into an LLM `user` message
   * @param prompt user prompt
   */
  user_content_to_llm_user_message: (prompt: content[]) => LLMMessageType;

  /**
   * @description Translate a specific LLM Assistant message into simple user content
   * @param message llm message
   */
  llm_assistant_message_to_user_content: (message: LLMMessageType) => content[];

}

//

