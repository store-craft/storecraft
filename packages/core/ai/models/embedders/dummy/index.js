/**
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 */


/**
 * @implements {AIEmbedder}
 */
export class DummyEmbedder {

  constructor() {
  }

  /** @type {AIEmbedder["tag"]} */
  get tag() {
    return {
      dimension: 1024,
      model: 'dummy-embedder-1024',
      provider: 'DummyEmbedder'
    }
  }

  /** @type {AIEmbedder["onInit"]} */
  onInit = (app) => {
  }


  /** @type {AIEmbedder["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {
    const { content } = params;
    return {
      content: content.map(
        (c, ix) => new Array(1024).fill(ix)
      )
    }
  }

}

