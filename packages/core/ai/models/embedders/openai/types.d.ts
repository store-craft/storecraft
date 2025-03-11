export * from './index.js';

export type config = {
  model?: ('text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002'),
  endpoint?: string,
  api_version?: string;
  /** If absent, will be infered from environment variable `OPENAI_API_KEY` */
  api_key?: string,
}
