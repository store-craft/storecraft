/**
 * @import { 
 *  config, RequestBody, RequestResult
 * } from "./types.js";
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 */



/**
 * @typedef {AIEmbedder<config>} Impl
 */

const strip_leading = (text = '') => {
  return (text[0]==='/') ? text.slice(1) : text;
}

/**
 * @implements {Impl}
 */
export class OpenAIEmbedder {
  #embeddings_url = '';

  /**
   * @param {config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      model: config.model ?? 'voyage-3',
      endpoint: config.endpoint ?? 'https://api.voyageai.com/',
      api_version: config.api_version ?? 'v1'
    }

    this.#embeddings_url = new URL(
      strip_leading(this.config.api_version + '/embeddings'), 
      this.config.endpoint
    ).toString();

  }

  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {

    const body = (/** @type {RequestBody} */ (
      {
        input_type: null,
        truncation: true,
        input: params.content.filter(c => c.type==='text').map(c => c.content),
        model: this.config.model,
        encoding_format: null
      }
    ))

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

    return {
      content: json.data.map(
        o => o.embedding
      )
    }
  }

}

