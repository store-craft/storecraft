import { content } from "../types.private.js"

/**
 * @description Parameters for the `storecraft` agent
 */
export type AgentRunParameters = {
  thread_id?: string;
  /**
   * @description The messages history of the conversation thread
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
   * @description Current customer prompt
   */
  contents: content[]
}