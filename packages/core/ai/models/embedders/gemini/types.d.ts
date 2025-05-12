export { GeminiEmbedder } from './index.js';

export type config = {
  /**
   * @default 'text-embedding-004'
   */
  model?: ('text-embedding-004' | 'text-embedding-001'),
  api_version?: string;

  /** If absent, will be infered from environment variable `GEMINI_API_KEY` */
  api_key?: string
}
