import { content } from "../types.private.js"

export type AgentConfig<AI> = {
  ai: AI
}

/**
 * @description Parameters for the `storecraft` agent
 */
export type AgentRunParameters = {
  thread_id?: string;
  /**
   * @description The Native **LLM** messages history of the conversation thread
   */
  history: any[],
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