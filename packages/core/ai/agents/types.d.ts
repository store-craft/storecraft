import { AI, content, LLMHistoryProvider } from "../core/types.private.js"

export type AgentConfig<MessageType extends any = any> = {
  ai: AI<MessageType>
}

/**
 * @description Parameters for the `storecraft` agent
 */
export type AgentRunParameters = {
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
  /**
   * @description Current customer prompt
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
 * @description Response for the `storecraft` agent stream / updates
 */
export type AgentRunStreamResponse = {
  /**
   * @description Current **LLM** formatted responses
   */
  stream: ReadableStream<content>;
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
}

/**
 * @description Response for the `storecraft` agent
 */
export type AgentRunResponse = {
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
  /**
   * @description Current **LLM** formatted responses
   */
  contents: content[];
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
}