import { z } from 'zod';
import { tool } from './tools.js';
import { App } from '../../types.public.js';
import { Message, content } from './types.chat.messages.js';
export type * from './types.chat.messages.js';

export type InferToolInputSchema<TOOL extends Tool> = 
  TOOL extends Tool<infer I, infer O> ? z.infer<I> : never;

export type InferToolReturnSchema<TOOL extends Tool> = 
  TOOL extends Tool<infer I, infer O> ? 
    (O extends z.ZodTypeAny ? z.infer<O> : O) : 
    never;

/**
 * @description General Tool specification
 */
export type Tool<
  ToolInput extends z.ZodTypeAny = any,
  ToolResult extends any = any,
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
     * @description Optional result type of tool in `zod` 
     * schema to confine and guide the output of {@link use} 
     * method
     */
    schema_result_zod?: ToolResult,

    /**
     * @description Invoke / Use the tool
     * 
     * @param input `zod` schema
     * @returns 
     */
    use: (input: z.infer<ToolInput>) => Promise<
      ToolResult extends z.ZodTypeAny ? 
        z.infer<ToolResult> : 
        ToolResult
    >;
  }

/**
 * @description Text generation parameters
 */
export type GenerateTextParams = {
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
  history?: Message[],
  /**
   * @description A user prompt in generic form, later will be 
   * translated into LLM specific message
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
export type GenerateTextResponse = {
  /**
   * @description Formatted response contents, including 
   * text, tool usage etc..
   */
  contents?: content[],
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
export type StreamTextCallbacks = {
  /**
   * @param delta_contents messages, that were generated.
   * Not including the user prompt
   */
  onDone?: (delta_contents: content[]) => Promise<any> | void
}

/**
 * @description **AI** Provider interface for text completion.
 * This is a generic interface for all LLMs,
 * such as OpenAI, Anthropic, etc.
 * @template Config config type
 * @template LLMMessageType Native LLM message type
 */
export interface ChatAI<
  Config extends any = any, 
  LLMMessageType extends any = any
  > {
  
  __message_type?: LLMMessageType;
  __gen_text_params_type?: GenerateTextParams;

  config?: Config;

  /**
   * @description Your chance to read `env` variable for the config
   * @param app `storecraft` app instance
   */
  onInit?: (app: App) => any | void;

  /**
   * @description The purpose of this method is to generate new {@link content} 
   * array based on,
   *  
   * #### 1. history
   * An Array of unified messages {@link Message} of role `user` and `assistant`
   * and {@link content} array.
   * 
   * such as:
   * ```js
   * [{ role:'user', contents: [{ type:'text', content: 'user prompt'}] }]
   * ```
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
    params: GenerateTextParams
  ) => Promise<GenerateTextResponse>;
  streamText?: (
    params: GenerateTextParams,
    callbacks?: StreamTextCallbacks
  ) => Promise<StreamTextResponse>

  /**
   * @description (Optional helper) Translate a generic user prompt into an 
   * LLM `user` message
   * @param prompt user prompt
   */
  user_content_to_native_llm_user_message?: (prompt: content[]) => LLMMessageType;

  /**
   * @description A helper function to translate a unified content {@link Message} 
   * into a native **LLM** message. All chat providers recieve unified messages,
   * and should know how to translate them into their own native messages.
   * This is optional method but recommended to implement.
   * @param message a unified message
   */
  history_message_to_native_llm_messages?: (message: Message) => LLMMessageType[];

}

//

