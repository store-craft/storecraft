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

export const ENV_CF_ACCOUNT_ID = 'CF_ACCOUNT_ID'
export const ENV_CF_API_KEY = 'CF_API_KEY'
export const ENV_CF_AI_API_KEY = 'CF_AI_API_KEY'
export const ENV_CF_EMAIL = 'CF_EMAIL'

/**
 * @implements {Impl}
 */
export class CloudflareEmbedder {

  /**
   * @param {config} config 
   */
  constructor(config) {
    this.config = {
      ...config,
      model: config.model ?? '@cf/baai/bge-large-en-v1.5',
    }
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.account_id = this.config.account_id ?? app.platform.env[ENV_CF_ACCOUNT_ID]; 
    this.config.api_key = this.config.api_key ?? app.platform.env[ENV_CF_AI_API_KEY] 
          ?? app.platform.env[ENV_CF_API_KEY]; 
    this.config.cf_email = this.config.cf_email ?? app.platform.env[ENV_CF_EMAIL]; 
  }


  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {
    if(
      this.config.account_id && this.config.api_key && this.config.cf_email
    ) {
      throw new Error('CloudflareEmbedder:: Missing config values !!!')
    }

    const embeddings_url = new URL(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.account_id}/ai/run/${this.config.model}`
    ).toString();

    const body = (/** @type {RequestBody} */ (
      {
        text: params.content.map(x => x.content)
      }
    ));
    
    const r = await fetch(
      embeddings_url,
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

