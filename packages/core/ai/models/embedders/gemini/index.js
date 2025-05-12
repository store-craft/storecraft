/**
 * @import { config } from "./types.js";
 * @import { 
 *  RequestBody, RequestResult
 * } from "./types.private.js";
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 * @import { ENV } from '../../../../types.public.js';
 */


/**
 * @typedef {AIEmbedder<config>} Impl
 */

const strip_leading = (text = '') => {
  return (text[0]==='/') ? text.slice(1) : text;
}

// https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=$GOOGLE_API_KEY

/**
 * @implements {Impl}
 */
export class GeminiEmbedder {

  /** @satisfies {ENV<config>} */
  static EnvConfig = /** @type{const} */ ({
    api_key: 'GEMINI_API_KEY'
  });

  /**
   * @param {config} [config={}] 
   */
  constructor(config={}) {
    this.config = /** @type {config} */ ({
      model: 'text-embedding-004',
      api_version: 'v1beta',
      ...config,
    });
  }

  /** @type {Impl["tag"]} */
  get tag() {
    return {
      dimension: 768,
      model: this.config.model,
      provider: 'GeminiEmbedder'
    }
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= 
      app.env[GeminiEmbedder.EnvConfig.api_key]; 
  }

  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {

    const embeddings_url = new URL(
      strip_leading(this.config.api_version + '/models/' + this.config.model + ':batchEmbedContents?key=' + this.config.api_key), 
      'https://generativelanguage.googleapis.com'
    ).toString();

    const body = (/** @type {RequestBody} */ (
      {
        requests: params.content.filter(
          c => c.type==='text'
        ).map(
          c => (
            {
              model: `models/${this.config.model}`,
              content: {
                parts: params.content.map(c => ({text: c.content}))
              }
            }
          )
        )
      }
    ));

    const r = await fetch(
      embeddings_url,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {RequestResult} */
    const json = await r.json();

    if(!r.ok) {
      throw new Error(JSON.stringify(json, null, 2));
    }
    
    // console.log(json)

    return {
      content: json.embeddings.map(
        o => o.values
      )
    }
  }

}

