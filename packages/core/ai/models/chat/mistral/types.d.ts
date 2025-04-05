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
  api_version?: string

  /** If missing, then will be read from environment variable `MISTRAL_API_KEY` */
  api_key?: string
}

export { Mistral } from './index.js';