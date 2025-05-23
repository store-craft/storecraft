/**
 * @import { PlatformAdapter } from '../types.public.js';
 * @import { Config } from './types.public.js';
 * @import { IncomingRequestCfProperties, type Request, type Response } from "@cloudflare/workers-types"
 */
import { pbkdf2 } from '../../crypto/public.js';

/**
 * @typedef {PlatformAdapter<Request<unknown, IncomingRequestCfProperties<unknown>>, any, Response>} CloudflareWorkersPlatformAdapter
 * 
 * @implements {CloudflareWorkersPlatformAdapter}
 */
export class CloudflareWorkersPlatform {

  /** @type {Config} */
  #config;

  /** @type {Record<string, any>} */
  #env;

  /**
   * 
   * @param {Config} [config={}] 
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
    
    // @ts-ignore
    return from;
  }


  /** @type {CloudflareWorkersPlatformAdapter["handleResponse"]} */
  async handleResponse(web_response, context) {
    // @ts-ignore
    return web_response;
  }  
} 