

export type config = {
  model?: "grok-2" | 
          "grok-2-vision",
          
  api_version?: string;
  api_key: string
}


export * from './index.js';