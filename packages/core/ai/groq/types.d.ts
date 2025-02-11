

export type config = {
  model?: "deepseek-r1-distill-llama-70b" | 
          "llama-3.3-70b-versatile" | 
          "llama-3.1-8b-instant" | 
          "gemma2-9b-it" | 
          "mixtral-8x7b-32768" | 
          "llama3-8b-8192" | 
          "llama-3.2-3b-preview",
  api_version?: string;
  api_key: string
}
