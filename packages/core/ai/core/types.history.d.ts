import { type App } from "../../types.public.js";

/**
 * @template LLMMessageType Native **LLM** message type
 * @description **LLM** history / memory
 */
export interface LLMHistory<LLMMessageType extends any = any> {

  threadId: string;
  add: (...messages: LLMMessageType[]) => this;
  commit?: () => Promise<this>;
  toArray?: () => LLMMessageType[];
}

/**
 * @template LLMMessageType Native **LLM** message type
 * @description **LLM** history / memory provider
 */
export interface LLMHistoryProvider<LLMMessageType extends any = any> {

  /**
   * @description Load the **LLM** messages history for a conversation/thread `id`
   * @param threadId Conversation `id`
   * @param app `storecraft` app instance for context
   */
  load: (threadId: string, app: App) => Promise<LLMHistory<LLMMessageType>>;

}