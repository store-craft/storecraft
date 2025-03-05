import type { AIEmbedder } from '../../../types.public.js';
export * from './index.js';

export type Config = {
  /** If absent, will be infered from environment variable `CF_ACCOUNT_ID` */
  account_id?: string;

  /** If absent, will be infered from environment variable `CF_VECTORIZE_API_KEY` and then `CF_API_KEY` */
  api_key?: string;

  /** If absent, will be infered from environment variable `CF_EMAIL` */
  cf_email?: string,

  /** 
   * @description name of the index 
   * @default 'vector_index'
   */
  index_name?: string,

  /** 
   * @description The dimensions of the vectors to be inserted in the index. 
   * @default 1536
   */
  dimension?: number,

  /**
   * @description Embedding model provider
   */
  embedder: AIEmbedder
}