import type { AIEmbedder } from '../../../types.public.js';
export * from './index.js';

export type Config = {
  /** If absent, will be infered from environment variable `PINECONE_API_KEY` */
  api_key?: string;
  
  /** This is a `url` where you should query the index, get it from the console | describe api call */
  index_host: string,
  embedder: AIEmbedder
}