/**
 * @import { 
 *  config, RequestBody, RequestResult
 * } from "./types.js";
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 */


// curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/ai/run/$MODEL_NAME \
//     -H 'Content-Type: application/json' \
//     -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
//     -H "X-Auth-Key: $CLOUDFLARE_API_KEY"


/**
 * @typedef {AIEmbedder<config>} Impl
 */


/**
 * @implements {Impl}
 */
export class CloudflareEmbedder {
  #embeddings_url = '';

  /**
   * @param {config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      model: config.model ?? '@cf/baai/bge-large-en-v1.5',
    }

    if(
      this.config.account_id && this.config.api_key && this.config.cf_email
    ) {
      throw new Error('CloudflareEmbedder:: Missing config values !!!')
    }

    this.#embeddings_url = new URL(
      `https://api.cloudflare.com/client/v4/accounts/${config.account_id}/ai/run/${config.model}`
    ).toString();

  }

  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {

    const body = (/** @type {RequestBody} */ (
      {
        text: params.content.map(x => x.content)
      }
    ));
    
    const r = await fetch(
      this.#embeddings_url,
      {
        method: 'post',
        headers: {
          'X-Auth-Email': this.config.cf_email,
          'X-Auth-Key': this.config.api_key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {RequestResult} */
    const json = await r.json();

    return {
      content: json.data
    }
  }

}

