import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';


/**
 * @typedef {import('@storecraft/core/v-platform').PlatformAdapter<
 *  Request, any, Response
 * >} PlatformAdapter
 * 
 * 
 * @implements {PlatformAdapter}
 */
export class BunPlatform {

  /** @type {import('./types.public.d.ts').BunPlatformConfig} */
  #config;

  /**
   * 
   * @param {import('./types.public.d.ts').BunPlatformConfig} [config={}] 
   */
  constructor(config={}) {
    this.#config = {
      ...config,
      scrypt_keylen: config?.scrypt_keylen ?? 64
    };
  }

  get env() {
    return Bun.env;
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