import { AI, content, LLMHistoryProvider } from "../core/types.private.js"

export type AgentConfig<MessageType extends any = any> = {
  ai: AI<MessageType>,
  history_provider: LLMHistoryProvider<MessageType>
}

/**
 * @description Parameters for the `storecraft` agent
 */
export type AgentRunParameters = {
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
 * @description Response for the `storecraft` agent
 */
export type AgentRunResponse = {
  /**
   * @description Current **LLM** formatted responses
   */
  contents: content[]
}