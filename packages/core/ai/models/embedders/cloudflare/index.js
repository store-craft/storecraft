/**
 * @import { 
 *  RequestBody, RequestResult, cf_response_wrapper
 * } from "./types.private.js";
 * @import { 
 *  config
 * } from "./types.js";
 * @import { 
 *  GenerateEmbeddingsParams, GenerateEmbeddingsResult, AIEmbedder
 * } from "../../../core/types.private.js";
 * @import { ENV } from '../../../../types.public.js';
 */


// curl https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/ai/run/$MODEL_NAME \
//     -H 'Content-Type: application/json' \
//     -H "X-Auth-Email: $CLOUDFLARE_EMAIL" \
//     -H "X-Auth-Key: $CLOUDFLARE_API_KEY"


/**
 * @typedef {AIEmbedder<config>} Impl
 */


/** @type {Record<config["model"], number>} */
const TAGS = {
  '@cf/baai/bge-large-en-v1.5': 1024,
  '@cf/baai/bge-base-en-v1.5': 768,
  '@cf/baai/bge-small-en-v1.5': 384,
}

/**
 * @implements {Impl}
 */
export class CloudflareEmbedder {

  /** @satisfies {ENV<config>} */
  static EnvConfig = /** @type{const} */ ({
    api_key: 'CF_AI_API_KEY',
    account_id: 'CF_ACCOUNT_ID',
  });

  /**
   * @param {config} config 
   */
  constructor(config={}) {
    this.config = {
      ...config,
      model: config.model ?? '@cf/baai/bge-large-en-v1.5',
    }
  }

  /** @type {Impl["tag"]} */
  get tag() {
    return {
      dimension: TAGS[this.config.model],
      model: this.config.model,
      provider: 'CloudflareEmbedder'
    }
  }

  /** @type {Impl["onInit"]} */
  onInit = (app) => {
    this.config.account_id ??= 
      app.env[CloudflareEmbedder.EnvConfig.account_id]; 

    this.config.api_key ??= 
      app.env[CloudflareEmbedder.EnvConfig.api_key] 
        ?? app.env['CF_API_KEY']; 
    // this.config.cf_email = this.config.cf_email ?? app.platform.env[ENV_CF_EMAIL]; 
  }


  /** @type {Impl["generateEmbeddings"]} */
  generateEmbeddings = async (params) => {
    if(
      !(this.config.account_id && this.config.api_key)
    ) {
      throw new Error('CloudflareEmbedder:: Missing config values !!!')
    }

    // console.log(this.config)

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
          'Authorization': `Bearer ${this.config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    /** @type {cf_response_wrapper<RequestResult>} */
    const json = await r.json();

    if(!json.success) {
      throw new Error(JSON.stringify(json, null, 2))
      // console.log(JSON.stringify(json, null, 2))
    }

    return {
      content: json?.result?.data
    }
  }

}

