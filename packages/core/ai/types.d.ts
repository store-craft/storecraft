
export type Tool<
  ToolInput extends any = any, 
  ToolOutput extends any = any
  > = {
  json_schema: object;
  execute: (input: ToolInput) => Promise<ToolOutput>;
}

export type GenerateTextParams<MessageType extends any = any> = {
  tools?: Tool[],
  messages: MessageType[],
  maxTokens?: number
}

export interface AI<
  Config extends any = any, 
  MessageType extends any = any,
  GenerateTextResponseType extends any = any
  > {
  
  __message_type?: MessageType;
  __gen_text_params_type?: GenerateTextParams<MessageType>;
  __gen_text_response_type?: GenerateTextResponseType;

  config?: Config;

  generateText: (
    params: GenerateTextParams<MessageType>
  ) => Promise<GenTextResponseType>;

}
