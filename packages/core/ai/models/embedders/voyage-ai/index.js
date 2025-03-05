/**
 * @import { 
 *  config, RequestBody, RequestResult
 * } from "./types.js";
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 */

export const ENV_VOYAGE_AI_API_KEY = 'VOYAGE_AI_API_KEY';

/**
 * @typedef {AIEmbedder<config>} Impl
 */

const strip_leading = (text = '') => {
  return (text[0]==='/') ? text.slice(1) : text;
}

/**
 * @implements {Impl}
 */
export class VoyageAIEmbedder {
  #embeddings_url = '';

  /**
   * @param {config} [config={}] 
   */
  constructor(config={}) {
    this.config = {
      ...config,
      model: config.model ?? 'voyage-3-1024',
      endpoint: config.endpoint ?? 'https://api.voyageai.com/',
      api_version: config.api_version ?? 'v1'
    }

    this.#embeddings_url = new URL(
      strip_leading(this.config.api_version + '/embeddings'), 
      this.config.endpoint
    ).toString();

  }

  get model_and_dim() {
    const parts = this.config.model.split('-');
    const model = parts.slice(0, -1).join('-');
    const output_dimension = parseFloat(parts.at(-1));
    return {
      model, output_dimension
    }
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_VOYAGE_AI_API_KEY]; 
  }

  /** @type {Impl["tag"]} */
  get tag() {
    const { model, output_dimension } = this.model_and_dim;
    
    return {
      dimension: output_dimension,
      model: model,
      provider: 'VoyageAIEmbedder'
    }
  }

  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {

    const { model, output_dimension } = this.model_and_dim;
    const body = (/** @type {RequestBody} */ (
      {
        input_type: null,
        truncation: true,
        input: params.content.filter(c => c.type==='text').map(c => c.content),
        model,
        output_dimension,
        encoding_format: null
      }
    ));

    const r = await fetch(
      this.#embeddings_url,
      {
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {RequestResult} */
    const json = await r.json();

    // console.log(json)

    return {
      content: json.data.map(
        o => o.embedding
      )
    }
  }

}

