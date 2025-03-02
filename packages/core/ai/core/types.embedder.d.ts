import { content_image, content_text } from "./types.chat.js"

/**
 * @description Text generation parameters
 */
export type GenerateEmbeddingParams = {
  content: (content_image | content_text)[]
}

/**
 * @description Text generation parameters
 */
export type GenerateEmbeddingResult = {
  content: number[][]
}


/**
 * @description **AI** Provider interface for embeddings
 * @template Config config type
 */
export interface AIEmbedder<
  Config extends any = any, 
  > {
  
  config?: Config;

  /**
   * @description The purpose of this method is to generate new embeddings
   * 
   * @param params params
   */
  generateEmbedding: (
    params: GenerateEmbeddingParams
  ) => Promise<GenerateEmbeddingResult>;
  
}

//

