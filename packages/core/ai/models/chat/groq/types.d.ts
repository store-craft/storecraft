export type config = {
  model?: "deepseek-r1-distill-llama-70b" | 
          "llama-3.3-70b-versatile" | 
          "llama-3.1-8b-instant" | 
          "gemma2-9b-it" | 
          "llama3-8b-8192" | 
          "llama-3.2-3b-preview",
  api_version?: string;
  
  /** If missing, then will be read from environment variable `GROQ_API_KEY` */
  api_key?: string
}

export * from './index.js';