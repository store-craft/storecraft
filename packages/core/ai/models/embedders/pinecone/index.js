/**
 * @import { 
 *  config, RequestBody, RequestResult
 * } from "./types.js";
 * @import { 
 *  AIEmbedder
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
   * @param {config} [config={}] 
   */
  constructor(config={}) {
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

    // now fix some defaults
    this.config.model.parameters = this.config.model.parameters ?? {};
    this.config.model.parameters.input_type = this.config.model.parameters.input_type ?? 'passage';
    this.config.model.parameters.truncate = this.config.model.parameters.truncate ?? 'END';
    if(this.config.model.name==='llama-text-embed-v2') {
      this.config.model.parameters.dimension = this.config.model.parameters.dimension ?? 1024;
    }
    
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_PINECONE_API_KEY]; 
  }

  /** @type {Impl["tag"]} */
  get tag() {
    return {
      dimension: this.config.model.name==='multilingual-e5-large' 
          ? 1024 : this.config.model.parameters.dimension,
      model: this.config.model.name,
      provider: 'PineconeEmbedder'
    }
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

    // console.log(body)

    const r = await fetch(
      this.#embeddings_url,
      {
        method: 'post',
        headers: {
          'Api-Key': this.config.api_key,
          'Content-Type': 'application/json',
          'X-Pinecone-API-Version': '2025-01'
        },
        body: JSON.stringify(body)
      }
    );

    // console.log(r)

    /** @type {RequestResult} */
    const json = await r.json();

    return {
      content: json.data.map(
        o => o.values
      )
    }
  }

}

