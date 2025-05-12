import { type App } from "../../types.public.js";
import { type Message } from "./types.chat.js";

/**
 * @description The type being saved in the history
 */
export type ChatHistoryType = {
  /**
   * @description The thread / chat id
   * @example `chat_i192m19p2su19m21p2m12`
   */
  thread_id?: string;
  /**
   * @description The metadata to save
   */
  metadata: Record<string, any>;
  /**
   * @description The chat messages
   */
  messages: Message[];
}

/**
 * @description chat history
 */
export interface History {
  /**
   * @description The thread id
   */
  threadId: string;
  /**
   * @description The messages to add to the history
   * @param messages messages to add
   */
  add: (...messages: Message[]) => this;
  /**
   * @description save current history
   * @param metadata metadata to save
   */
  commit?: (metadata?: Record<string, any>) => Promise<this>;
  /**
   * @description get the history messages
   */
  toArray?: () => Message[];
  /**
   * @description get the history metadata
   */
  metadata?: () => ChatHistoryType['metadata'];
}

/**
 * @description Chat history provider
 */
export interface HistoryProvider {

  /**
   * @description Load the **LLM** messages history for a 
   * conversation/thread `id`
   * @param threadId Conversation `id`
   * @param app `storecraft` app instance for context
   */
  load: (threadId: string, app: App) => Promise<History>;

}