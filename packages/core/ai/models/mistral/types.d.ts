export type config = {
  model?: "mistral-large-latest" | 
          "pixtral-large-latest" | 
          "mistral-saba-latest" | 
          "ministral-3b-latest" | 
          "ministral-8b-latest" |
          "codestral-latest" |
          "mistral-small-latest" |
          "pixtral-12b-2409" |
          "open-mistral-nemo",
  api_key: string,
  api_version?: string
}

export * from './index.js';