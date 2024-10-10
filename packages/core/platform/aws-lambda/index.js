/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { getProcessor } from './aws.utils.js';
import { NodeCrypto } from '../node/node.crypto.js';


/**
 * @typedef {{
 *  _sc_event?: import('./types.private.d.ts').LambdaEvent,
 * } & import('./types.private.d.ts').LambdaContext} PlatformContext
 * 
 * @typedef {PlatformAdapter<
 *  import('./types.private.js').LambdaEvent, 
 *  PlatformContext, 
 *  import('./types.private.js').APIGatewayProxyResult
 * >} AWSLambdaPlatformAdapter
 * 
 * 
 * @implements {AWSLambdaPlatformAdapter}
 */
export class AWSLambdaPlatform {

  /** @type {import('./types.public.d.ts').AWSLambdaConfig} */
  #config;

  /** @type {NodeCrypto} */
  #crypto;

  /**
   * 
   * @param {import('./types.public.d.ts').AWSLambdaConfig} [config={}] 
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

  /** @type {AWSLambdaPlatformAdapter["crypto"]} */
  get crypto() {
    return this.#crypto;
  }

  /**
   * @type {AWSLambdaPlatformAdapter["encode"]}
   */
  async encode(from, ctx) {
    const event = ctx._sc_event = from;
    const processor = getProcessor(event);
    const req = processor.createRequest(event);

    return req;
  }

  /**
   * 
   * @type {AWSLambdaPlatformAdapter["handleResponse"]}
   */
  async handleResponse(web_response, ctx) {
    const processor = getProcessor(ctx._sc_event);

    return processor.createResult(ctx._sc_event, web_response);
  }  
} 