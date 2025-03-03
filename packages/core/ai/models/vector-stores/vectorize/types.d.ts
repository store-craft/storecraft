import type { AIEmbedder } from '../../../types.public.js';
export * from './index.js';

export type Config = {
  account_id: string;
  api_key: string;
  cf_email: string,
  index_name: string,
  embedder: AIEmbedder
}