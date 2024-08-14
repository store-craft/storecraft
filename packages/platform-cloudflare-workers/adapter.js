import { pbkdf2 } from '@storecraft/core/v-crypto';

/**
 * @typedef {import('@storecraft/core/v-platform').PlatformAdapter<
 *  Request, any, Response
 * >} PlatformAdapter
 * 
 * 
 * @implements {PlatformAdapter}
 */
export class CloudflareWorkersPlatform {

  /** @type {import('./types.public').Config} */
  #config;

  /**
   * 
   * @param {import('./types.public').Config} [config={}] 
   */
  constructor(config={}) {
    this.#config = {
      ...config,
      hash_iterations: config?.hash_iterations ?? 1000,
      env: config.env ?? {}
    };
  }

  get env() {
    return this.#config.env;
  }

  /** @type {PlatformAdapter["crypto"]} */
  get crypto() {

    return {
      hash: (password) => {
        return pbkdf2.hash(password)
      },

      verify: (hash, password) => {
        return pbkdf2.verify(hash, password);
      }
    }
  }

  /** @type {PlatformAdapter["encode"]} */
  async encode(from) {
    from.duplex = 'half';
    return from;
  }


  /** @type {PlatformAdapter["handleResponse"]} */
  async handleResponse(web_response, context) {
    return web_response;
  }  
} 