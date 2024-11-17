/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { NodeCrypto } from '../node/node.crypto.js';


/**
 * @typedef {PlatformAdapter<Request, any, Response>} BunPlatformAdapter
 * 
 * @implements {BunPlatformAdapter}
 */
export class BunPlatform {

  /** @type {import('./types.public.d.ts').BunPlatformConfig} */
  #config;

  /** @type {NodeCrypto} */
  #crypto;

  /**
   * 
   * @param {import('./types.public.d.ts').BunPlatformConfig} [config={}] 
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
    // @ts-ignore
    return Bun.env;
  }

  /** @type {BunPlatformAdapter["crypto"]} */
  get crypto() {
    return this.#crypto;
  }

  /**
   * @type {BunPlatformAdapter["encode"]}
   */
  encode(from) {
    return Promise.resolve(from);
  }

  /**
   * @type {BunPlatformAdapter["handleResponse"]}
   */
  async handleResponse(web_response, context) {
    return web_response;
  }  
} 