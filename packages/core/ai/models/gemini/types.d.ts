export type config = {
  model?: "gemini-2.0-flash" | 
          "gemini-2.0-flash-lite-preview-02-05" | 
          "gemini-1.5-flash" | 
          "gemini-1.5-flash-8b" | 
          "gemini-1.5-pro"
  api_key: string
}

export * from './index.js';