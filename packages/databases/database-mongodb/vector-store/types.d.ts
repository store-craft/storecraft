
import type { AIEmbedder } from '@storecraft/core/ai';
import type { MongoClientOptions } from 'mongodb';
export * from './index.js';

export type Config = {
  /**
   * @description mongo connection url, if absent, will be infered at init
   * with env `MONGODB_VECTOR_STORE_URL` or `MONGODB_URL`
   */
  url?: string;

  /** 
   * @description the name of the database, if absent, will be infered at init
   * with env `MONGODB_VECTOR_STORE_NAME` or `MONGODB_NAME` 
   * @default 'main'
   */
  db_name?: string;

  /** 
   * @description mongo client options 
   */
  options?: MongoClientOptions;

  /**
   * @description The name of the index
   * @default 'vector_store'
   */
  index_name?: string,

  /** 
   * @description The dimensions of the vectors to be inserted in the index. 
   * @default 1536
   */
  dimensions?: number,

  /**
   * @description The similiarity metric
   * @default 'cosine'
   */
  similarity?: 'euclidean' | 'cosine' | 'dotProduct',

  embedder: AIEmbedder
}
