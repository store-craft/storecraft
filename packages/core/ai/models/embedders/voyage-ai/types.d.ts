export * from './index.js';

export type config = {
  /**
   * @default voyage-3-large-1024
   */
  model?: (
    `voyage-3-large-${256 | 512 | 1024 | 2048}` | 
    'voyage-3-1024' | 
    'voyage-3-lite-512' | 
    `voyage-code-3-${256 | 512 | 1024 | 2048}` | 
    'voyage-finance-2-1024' | 
    'voyage-law-2-1024' |
    'voyage-code-2-1536'
  ),
  endpoint?: string,
  api_version?: string;

  /** If absent, will be infered from environment variable `VOYAGE_AI_API_KEY` */
  api_key?: string
}
