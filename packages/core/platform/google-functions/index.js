/**
 * @import { PlatformAdapter } from '../types.public.js';
 * @import { GoogleFunctionRequest, GoogleFunctionResponse } from './types.private.js';
 */
import { NodeCrypto } from '../node/node.crypto.js';


/**
 * @typedef {PlatformAdapter<GoogleFunctionRequest, GoogleFunctionResponse, GoogleFunctionResponse>} GoogleFunctionPlatformAdapter
 * 
 * @implements {GoogleFunctionPlatformAdapter}
 */
export class GoogleFunctionsPlatform {

  /** @type {import('./types.public.d.ts').Config} */
  #config;

  /** @type {NodeCrypto} */
  #crypto;

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config={}] 
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
    // console.log(Deno.env.toObject())
    return process?.env;
  }

  /** @type {GoogleFunctionPlatformAdapter["crypto"]} */
  get crypto() {
    return this.#crypto;
  }

  /**
   * @type {GoogleFunctionPlatformAdapter["encode"]}
   */
  async encode(from) {
    const empty_body = (from.method==='HEAD' || from.method==='GET');
    
    /** @type {RequestInit} */
    const init = {
      method: from.method,
      // @ts-ignore
      headers: from.headers,
      // @ts-ignore
      duplex: 'half'
    }

    if(!empty_body) {
      init.body = new ReadableStream(
        {
          start(controller){
            controller.enqueue(from.rawBody);
            controller.close();
          }
        }
      );
    }

    const web_req = new Request(
      `http://localhost${from.url}`,
      init
    );
  
    return web_req;
  }

  /**
   * @type {GoogleFunctionPlatformAdapter["handleResponse"]}
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