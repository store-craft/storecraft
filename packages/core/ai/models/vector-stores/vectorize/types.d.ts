import type { AIEmbedder } from '../../../types.public.js';
export * from './index.js';

export type Config = {
  /** If absent, will be infered from environment variable `CF_ACCOUNT_ID` */
  account_id?: string;

  /** If absent, will be infered from environment variable `CF_API_KEY` */
  api_key?: string;

  /** If absent, will be infered from environment variable `CF_EMAIL` */
  cf_email?: string,
  
  index_name: string,
  embedder: AIEmbedder
}