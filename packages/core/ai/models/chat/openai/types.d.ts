export { OpenAI } from './index.js';

export type config = {
  model?: ('o1-mini' | 'gpt-4o' | 'gpt-4' | 'gpt-4o-mini' | 'gpt-4-turbo'),
  endpoint?: string,
  api_version?: string;

  /** If missing, then will be read from environment variable `OPENAI_API_KEY` */
  api_key?: string
}
