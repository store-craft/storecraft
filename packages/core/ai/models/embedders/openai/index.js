/**
 * @import { 
 *  config
 * } from "./types.js";
 * @import { 
 *  RequestBody, RequestErrorResult, RequestResult
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

/** @type {Record<config["model"], number>} */
const DIM = {
  'text-embedding-ada-002': 1536,
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072
}

/**
 * @implements {Impl}
 */
export class OpenAIEmbedder {

  /** @satisfies {ENV<config>} */
  static EnvConfig = /** @type{const} */ ({
    api_key: 'OPENAI_API_KEY'
  });

  #embeddings_url = '';

  /**
   * @param {config} [config={}] 
   */
  constructor(config={}) {
    this.config = {
      ...config,
      model: config.model ?? 'text-embedding-3-large',
      endpoint: config.endpoint ?? 'https://api.openai.com/',
      api_version: config.api_version ?? 'v1'
    }

    this.#embeddings_url = new URL(
      strip_leading(this.config.api_version + '/embeddings'), 
      this.config.endpoint
    ).toString();

  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.api_key ??= app.platform.env[OpenAIEmbedder.EnvConfig.api_key]; 
  }

  /** @type {Impl["tag"]} */
  get tag() {
    return {
      dimension: DIM[this.config.model],
      model: this.config.model,
      provider: 'OpenAIEmbedder'
    }
  }
  

  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {

    if(this.config.api_key === undefined) {
      console.warn(
        'OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable \
        or programatically in the constructor config.'
      );
      return undefined;
    }

    const body = (/** @type {RequestBody} */ (
      {
        input: params.content.filter(c => c.type==='text').map(c => c.content),
        model: this.config.model,
        encoding_format: 'float'
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
    
    if(!r.ok) {
      if('error' in json) {
        throw json.error;
      }
      throw json;
    }

    return {
      content: json.data.map(
        o => o.embedding
      )
    }
  }

}

