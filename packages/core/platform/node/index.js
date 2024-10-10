/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { Readable } from 'node:stream'
import { IncomingMessage, ServerResponse } from "node:http";
import { NodeCrypto } from './node.crypto.js';


/**
 * 
 * @implements {PlatformAdapter<IncomingMessage, ServerResponse, ServerResponse>}
 */
export class NodePlatform {

  /** @type {import('./types.public.d.ts').NodePlatformConfig} */
  #config;

  /** @type {NodeCrypto} */
  #crypto;

  /**
   * 
   * @param {import('./types.public.d.ts').NodePlatformConfig} [config={}] 
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
    return process?.env;
  }

  /** @type {PlatformAdapter["crypto"]} */
  get crypto() {
    return this.#crypto;
  }

  /**
   * @param {IncomingMessage} from
   * 
   * @returns {Promise<Request>}
   */
  async encode(from) {

    /** @type {RequestInit} */
    const init = {
      method: from.method,
      // @ts-ignore
      headers: from.headers,
      duplex: 'half',
      // @ts-ignore
      body: (from.method==='HEAD' || from.method==='GET') ? undefined : Readable.toWeb(from),
    }

    /** @type {Request} */
    const web_req = new Request(
      `http://localhost${from.url}`,
      init
    )
  
    return web_req
  }

  /**
   * 
   * @param {Response} web_response 
   * @param {ServerResponse} context 
   */
  async handleResponse(web_response, context) {
    try {
      const headers = Object.fromEntries(
        web_response?.headers?.entries() ?? []
      );
      context.writeHead(
        web_response.status, web_response.statusText, headers
      );

      if(web_response.body) {
        // this is buggy and not finishing, stalls infinitely
        // await finished(Readable.fromWeb(web_response.body).pipe(context))

        // I found this to be better
        const reader = web_response.body.getReader();
        const read_more = async () => {
          const { done, value } = await reader.read();
          if (!done) {
            context.write(value);
            await read_more();
          }
        }

        await read_more(); 
      } 
    } catch (e) {
      console.log(e);
    } finally {
      context.end();
      return context;
    }
  }  
} 