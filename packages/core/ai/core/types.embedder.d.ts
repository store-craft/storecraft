import { content_image, content_text } from "./types.chat.js"

/**
 * @description Text generation parameters
 */
export type GenerateEmbeddingsParams = {
  content: (content_image | content_text)[]
}

/**
 * @description Text generation parameters
 */
export type GenerateEmbeddingsResult = {
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
  generateEmbeddings: (
    params: GenerateEmbeddingsParams
  ) => Promise<GenerateEmbeddingsResult>;
  
}

//

