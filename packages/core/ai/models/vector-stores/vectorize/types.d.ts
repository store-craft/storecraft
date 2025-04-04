import type { AIEmbedder } from '../../../types.public.js';
import { create_vector_index_params } from './types.private.vectorize.js';
export { Vectorize } from './index.js';

export type Config = {
  /** If absent, will be infered from environment variable `CF_ACCOUNT_ID` */
  account_id?: string;

  /** If absent, will be infered from environment variable `CF_VECTORIZE_API_KEY` and then `CF_API_KEY` */
  api_key?: string;

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
   * @description The similiarity metric used to build the index 
   * and calculate similarity between vectors.
   * @default 'cosine'
   */
  metric?: 'cosine' | 'euclidean' | 'dotproduct';

  /**
   * @description Embedding model provider
   */
  embedder: AIEmbedder
}

export type CreateVectorIndexParams = {
  description?: string, 
  metric?: create_vector_index_params["config"]["metric"];
}