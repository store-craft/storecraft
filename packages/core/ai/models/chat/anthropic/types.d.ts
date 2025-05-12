export { Anthropic } from './index.js';

export type config = {
  /**
   * @default 'claude-3-5-sonnet-20241022'
   */
  model?: (
    'claude-3-5-sonnet-20241022' | 
    'claude-3-5-haiku-20241022' | 
    'claude-3-haiku-20240307' | 
    'claude-3-opus-20240229'),
  api_version?: string;
  anthropic_version?: string;

  /** If missing, then will be read from environment variable `ANTHROPIC_API_KEY` */
  api_key?: string
}
