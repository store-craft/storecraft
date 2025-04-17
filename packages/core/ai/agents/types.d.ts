import { type App } from "../../types.public.js";
import { ChatAI, content, LLMHistoryProvider } from "../core/types.private.js"

export type AgentConfig<ChatAIProvider extends ChatAI = ChatAI> = {
  /**
   * @description AI chat provider
   */
  chat_ai_provider?: ChatAIProvider;
  /**
   * @description Maximal amount of history messages to use. This 
   * can be beneficial for optimizaing usage cost and context window.
   * @default 5
   */
  maxLatestHistoryToUse?: number;
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
   * @description Maximal amount of history messages to use during this run. This 
   * can be beneficial for optimizaing usage cost and context window. This overrides
   * the general {@link AgentConfig.maxLatestHistoryToUse}
   * @default 5
   */
  maxLatestHistoryToUse?: number;
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
   * @description Current **LLM** formatted responses
   */
  contents: content[];
  /**
   * @description The `thread` / `conversation` identifier
   */
  thread_id?: string;
}

/**
 * @description A general **AI** `agent` interface
 */
export interface Agent {

  init: (app: App) => any | void;

  /**
   * @description Run agent in stream mode
   * @param params agent params
   */
  runStream: (params: AgentRunParameters) => Promise<AgentRunStreamResponse>;

  /**
   * @description Run agent in non-stream mode
   * @param params agent params
   */
  run: (params: AgentRunParameters) => Promise<AgentRunResponse>;

}

