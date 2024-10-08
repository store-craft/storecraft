// import { Readable } from 'node:stream'
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';



/**
 * @typedef {import('../types.public.js').PlatformAdapter<
 *  import('./types.private.js').GoogleFunctionRequest, 
 *  import('./types.private.js').GoogleFunctionResponse, 
 *  import('./types.private.js').GoogleFunctionResponse
 * >} PlatformAdapter
 * 
 * 
 * @implements {PlatformAdapter}
 */
export class GoogleFunctionsPlatform {

  /** @type {import('./types.public.d.ts').Config} */
  #config;

  /**
   * 
   * @param {import('./types.public.d.ts').Config} [config={}] 
   */
  constructor(config={}) {
    this.#config = {
      ...config,
      scrypt_keylen: config?.scrypt_keylen ?? 64
    };
  }

  get env() {
    // console.log(Deno.env.toObject())
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
  async encode(from) {
    const empty_body = (from.method==='HEAD' || from.method==='GET');
    
    /** @type {RequestInit} */
    const init = {
      method: from.method,
      // @ts-ignore
      headers: from.headers,
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
   * @type {PlatformAdapter["handleResponse"]}
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