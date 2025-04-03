import { type AIEmbedder } from '../../../types.public.js';
export * from './index.js';

export type Config = {
  /** If absent, will be infered from environment variable `PINECONE_API_KEY` */
  api_key?: string;
  
  /**
   * @description The index name
   * @default 'vector-index'
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
  embedder: AIEmbedder,
}