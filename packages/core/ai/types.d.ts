import { z } from 'zod';
import { tool } from './index.js'

/**
 * @description General Tool specification
 */
export type Tool<
  ToolInput extends z.ZodTypeAny=any,
  ToolResult extends any = any
  > = {
    /**
     * @description schema of tool
     */
    schema: {
      description: string,
      /**
       * @description `zod` schema for the parameters of the tool
       */
      parameters: ToolInput,
    };
    use: (input: z.infer<ToolInput>) => Promise<ToolResult>;
  }



/** @description A general content type from and to user */
export type content = {
  type: 'text' | 'image' | 'tool' | 'json' | 'error' | (string & {}),
  content: string;
  meta_data?: any;
}

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
export type GenerateTextResponse = {
  contents: content[]
}

/**
 * @description **AI** Provider interface
 */
export interface AI<
  Config extends any = any, 
  MessageType extends any = any
  > {
  
  __message_type?: MessageType;
  __gen_text_params_type?: GenerateTextParams<MessageType>;

  config?: Config;

  /**
   * @description The purpose of this method is to generate new {@link content} array based on 
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
   * A dictionary of {@link Tool}. Each has schema typed with `zod`. Be sure to use the {@link tool} helper
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
    params: GenerateTextParams<MessageType>
  ) => Promise<GenerateTextResponse>;

  /**
   * @description Translate a generic user prompt into an LLM `user` message
   * @param prompt user prompt
   */
  user_content_to_llm_user_message: (prompt: content[]) => MessageType[];

  /**
   * @description Translate a specific LLM Assistant message into simple user content
   * @param message llm message
   */
  llm_assistant_message_to_user_content: (message: MessageType) => content[];


}
