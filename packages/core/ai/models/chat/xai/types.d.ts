export type config = {
  /**
   * @default 'grok-3'
   */
  model?: "grok-2" | 
          "grok-2-vision" | 
          'grok-3',
          
  api_version?: string;
  /** If missing, then will be read from environment variable `XAI_API_KEY` */
  api_key?: string
}

export { XAI } from './index.js';