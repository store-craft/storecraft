/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { pbkdf2 } from '@storecraft/core/crypto';

/**
 * @typedef {PlatformAdapter<Request, any, Response>} CloudflareWorkersPlatformAdapter
 * 
 * @implements {CloudflareWorkersPlatformAdapter}
 */
export class CloudflareWorkersPlatform {

  /** @type {import('./types.public.d.ts').Config} */
  #config;

  /** @type {Record<string, any>} */
  #env;

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config={}] 
   */
  constructor(config={}) {
    this.#env = config.env ?? {};
    this.#config = {
      ...config,
      hash_iterations: config?.hash_iterations ?? 1000,
    };
  }

  get env() {
    return this.#env;
  }

  set env($env) {
    this.#env = $env;
  }


  /** @type {CloudflareWorkersPlatformAdapter["crypto"]} */
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

  /** @type {CloudflareWorkersPlatformAdapter["encode"]} */
  async encode(from) {
    // @ts-ignore
    from.duplex = 'half';
    return from;
  }


  /** @type {CloudflareWorkersPlatformAdapter["handleResponse"]} */
  async handleResponse(web_response, context) {
    return web_response;
  }  
} 