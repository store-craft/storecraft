export type config = {
  model?: "grok-2" | 
          "grok-2-vision",
          
  api_version?: string;
  /** If missing, then will be read from environment variable `XAI_API_KEY` */
  api_key?: string
}

export * from './index.js';