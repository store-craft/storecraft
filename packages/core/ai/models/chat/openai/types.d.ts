import { chat_completion_input } from './types.private.js';

export { OpenAI } from './index.js';

export type config = {
  model?: ('o1-mini' | 'gpt-4o' | 'gpt-4' | 'gpt-4o-mini' | 'gpt-4-turbo') & string,
  endpoint?: string,
  api_version?: string;

  /** If missing, then will be read from environment variable `OPENAI_API_KEY` */
  api_key?: string,
  
  __hooks?: {
    /**
     * Many providers use the OpenAI API, but they have some
     * differences in the request format. This hook allows
     * you to modify the request before it is sent to the
     * provider. 
     * @param input input - The input to the chat completion request
     */
    pre_request: (input: chat_completion_input) => chat_completion_input
  }
}
