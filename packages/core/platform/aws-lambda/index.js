import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { getProcessor } from './aws.utils.js';


/**
 * @typedef {{
 *  _sc_event?: import('./types.private.d.ts').LambdaEvent,
 * } & import('./types.private.d.ts').LambdaContext} PlatformContext
 * 
 * @typedef {import('../types.public.js').PlatformAdapter<
 *  import('./types.private.js').LambdaEvent, 
 *  PlatformContext, 
 *  import('./types.private.js').APIGatewayProxyResult
 * >} PlatformAdapter
 * 
 * 
 * @implements {PlatformAdapter}
 */
export class AWSLambdaPlatform {

  /** @type {import('./types.public.d.ts').AWSLambdaConfig} */
  #config;

  /**
   * 
   * @param {import('./types.public.d.ts').AWSLambdaConfig} [config={}] 
   */
  constructor(config={}) {

    this.#config = {
      ...config,
      scrypt_keylen: config?.scrypt_keylen ?? 64
    };
  }

  get env() {
    return process?.env;
  }

  /** @type {PlatformAdapter["crypto"]} */
  get crypto() {
    const c = this.#config;

    return {
      hash: (password) => {
        return new Promise(
          (resolve, reject) => {
            // generate random 16 bytes long salt - recommended by NodeJS Docs
            const salt = randomBytes(16).toString("hex");
    
            scrypt(
              password, salt, c.scrypt_keylen, c.scrypt_options,
              (err, derivedKey) => {
                if (err) reject(err);
                // derivedKey is of type Buffer
                resolve(`${salt}.${derivedKey.toString("hex")}`);
              }
            );
          }
        );
      },

      verify: (hash, password) => {
        return new Promise(
          (resolve, reject) => {
            const [salt, hashKey] = hash?.split(".");

            if(!salt || !hashKey)
              reject(false);

            // we need to pass buffer values to timingSafeEqual
            const hashKeyBuff = Buffer.from(hashKey, "hex");
            scrypt(
              password, salt, c.scrypt_keylen, c.scrypt_options, 
              (err, derivedKey) => {
                if (err) reject(err);
                // compare the new supplied password with the 
                // hashed password using timeSafeEqual
                resolve(timingSafeEqual(hashKeyBuff, derivedKey));
              }
            );
          }
        );
      }
    }
  }

  /**
   * @type {PlatformAdapter["encode"]}
   */
  async encode(from, ctx) {
    const event = ctx._sc_event = from;
    const processor = getProcessor(event);
    const req = processor.createRequest(event);

    return req;
  }

  /**
   * 
   * @type {PlatformAdapter["handleResponse"]}
   */
  async handleResponse(web_response, ctx) {
    const processor = getProcessor(ctx._sc_event);

    return processor.createResult(ctx._sc_event, web_response);
  }  
} 