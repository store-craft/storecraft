/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { NodeCrypto } from '../node/node.crypto.js';

/**
 * 
 * @implements {PlatformAdapter<Request, any, Response>}
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

  /** @type {PlatformAdapter["crypto"]} */
  get crypto() {
    return this.#crypto;
  }

  /**
   * @type {PlatformAdapter["encode"]}
   */
  encode(from) {
    return Promise.resolve(from);
  }

  /**
   * @type {PlatformAdapter["handleResponse"]}
   */
  async handleResponse(web_response, context) {
    return web_response;
  }  
} 