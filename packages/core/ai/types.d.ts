import { z } from 'zod';

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
      name: string,
      description: string,
      /**
       * @description `zod` schema for the parameters of the tool
       */
      parameters: ToolInput,
    };
    use: (input: z.infer<ToolInput>) => Promise<ToolResult>;
  }

/**
 * @description A user prompt in generic form, later will be translated into LLM specific message
 */
export type UserPrompt = {
  type: 'text',
  content: string | string[];
}

export type GenerateTextParams<MessageType extends any = any> = {
  /**
   * @description tools
   */
  tools?: Tool[],
  /**
   * @description history native messages specific to the LLM
   */
  messages: MessageType[],
  /**
   * @description A user prompt in generic form, later will be translated into LLM specific message
   */
  prompt: UserPrompt,
  maxTokens?: number
}

/**
 * @description **AI** Provider interface
 */
export interface AI<
  Config extends any = any, 
  MessageType extends any = any,
  GenerateTextResponseType extends any = any
  > {
  
  __message_type?: MessageType;
  __gen_text_params_type?: GenerateTextParams<MessageType>;
  __gen_text_response_type?: GenerateTextResponseType;

  config?: Config;

  /**
   * @description Generate text
   * @param params params
   */
  generateText: (
    params: GenerateTextParams<MessageType>
  ) => Promise<GenTextResponseType>;

  /**
   * @description Translate a generic user prompt into an LLM `user` message
   * @param prompt user prompt
   */
  translateUserPrompt: (prompt: UserPrompt) => MessageType;

}
