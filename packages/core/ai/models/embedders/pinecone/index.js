/**
 * @import { 
 *  config, RequestBody, RequestResult
 * } from "./types.js";
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 */

export const ENV_PINECONE_API_KEY = 'PINECONE_API_KEY'

/**
 * @typedef {AIEmbedder<config>} Impl
 */


/**
 * @implements {Impl}
 */
export class PineconeEmbedder {
  #embeddings_url = 'https://api.pinecone.io/embed';

  /**
   * @param {config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      model: config.model ?? {
        name: 'multilingual-e5-large',
        parameters: {
          input_type: 'passage',
          truncate: 'END'
        }
      }
    }
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_PINECONE_API_KEY]; 
  }

  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {

    const body = (/** @type {RequestBody} */ (
      {
        parameters: this.config.model.parameters,
        model: this.config.model.name,
        inputs: params.content.map(
          c => (
            {
              text: c.content
            }
          )
        )

      }
    ));

    const r = await fetch(
      this.#embeddings_url,
      {
        method: 'post',
        headers: {
          'Api-Key': this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {RequestResult} */
    const json = await r.json();

    return {
      content: json.data.map(
        o => o.values
      )
    }
  }

}

