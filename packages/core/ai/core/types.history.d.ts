import { type App } from "../../types.public.js";
import { Message } from "./types.chat.js";

/**
 * @description The type being saved in the history
 */
export type ChatHistoryType = {
  metadata: {
    created_at?: string;
    updated_at?: string;
    thread_id?: string;
    /**
     * @description The customer `id` or `email`
     * @example `cus_1234567890`
     * @example `john@doe.com`
     */
    user?: string;
    /**
     * @description Extra search terms to index in the database.
     */
    search?: string[];
    /**
     * @description Extra metadata coming from consumer.
     */
    extra?: Record<string, any>;
  },
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