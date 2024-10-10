/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { NodeCrypto } from '../node/node.crypto.js';

/**
 * @typedef {PlatformAdapter<Request, any, Response>} DenoPlatformAdapter
 * 
 * @implements {DenoPlatformAdapter}
 */
export class DenoPlatform {

  /** @type {import('./types.public.d.ts').DenoPlatformConfig} */
  #config;

  /** @type {NodeCrypto} */
  #crypto;

  /**
   * 
   * @param {import('./types.public.d.ts').DenoPlatformConfig} [config={}] 
   */
  constructor(config={}) {
    this.#config = {
      ...config,
      scrypt_keylen: config?.scrypt_keylen ?? 64
    };

    this.#crypto = new NodeCrypto(
      this.#config.scrypt_keylen, 
      this.#config.scrypt_options
    );

  }

  get env() {
    return Deno.env.toObject();
  }

  /** @type {DenoPlatformAdapter["crypto"]} */
  get crypto() {
    return this.#crypto;
  }

  /**
   * @type {DenoPlatformAdapter["encode"]}
   */
  encode(from) {
    return Promise.resolve(from);
  }

  /**
   * @type {DenoPlatformAdapter["handleResponse"]}
   */
  async handleResponse(web_response, context) {
    return web_response;
  }  
} 