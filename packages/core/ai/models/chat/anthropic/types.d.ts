export * from './index.js';

export type config = {
  model?: (
    'claude-3-5-sonnet-20241022' | 
    'claude-3-5-haiku-20241022' | 
    'claude-3-haiku-20240307' | 
    'claude-3-opus-20240229'),
  api_version?: string = "v1";
  anthropic_version?: string = "2023-06-01";

  /** If missing, then will be read from environment variable `ANTHROPIC_API_KEY` */
  api_key?: string
}
