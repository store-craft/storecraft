import { STATUS_CODES } from './v-polka/codes.js';
import { create_api } from './v-api/index.js'
export * from './types.api.enums.js'

/**
 * @template {any} PlatformNativeRequest
 * @template {any} PlatformContext
 * @template {any} H
 */
export class App {

  /** 
   * @typedef {import('./types.public.js').PlatformAdapter<PlatformNativeRequest, PlatformContext, H>} Platform
   * @type {Platform} 
   */
  #_platform;
  /** @type {import('./types.driver.js').db_driver} */
  #_db_driver;
  /** @type {import('./types.storage.js').storage_driver} */
  #_storage;

  /**
   * 
   * @param {Platform} platform 
   * @param {import('./types.driver.js').db_driver} db_driver 
   * @param {import('./types.storage.js').storage_driver} storage 
   */
  constructor(platform, db_driver, storage) {

    this.#_platform = platform;
    this.#_db_driver = db_driver;
    this.#_storage = storage;
  }

  async init() {
    try{
      await this.db.init(this)
      await this.storage.init(this)
    } catch (e) {
      console.error(e)
    }
    this._polka = create_api(this);
    return this;
  }

  /**
   * Get the Polka router
   */
  get db() {
    return this.#_db_driver;
  }
  
  /**
   * Get the Polka router
   */
  get polka() {
    return this._polka
  }

  /**
   * Get the native platform object
   */
  get platform() {
    return this.#_platform
  }

  /**
   * Get the native storage object
   */
  get storage() {
    return this.#_storage
  }

  hello = () => {}

  /**
   * Process a request with context in the native platform
   * 
   * @param {PlatformNativeRequest} req
   * @param {PlatformContext} context 
   */
  handler = async (req, context) => {
    const request = await this.#_platform.encode(req)
    
    /** @type {import('./types.public.js').ApiResponse} */
    const polka_response = {
      headers: new Headers(),
      finished: false,
      status: 200,
      statusText: 'OK',
      body: undefined,

      send(body) {
        this.body = body;
        this.finished = true;
        return this;
      },

      end() {
        return this.send(undefined);
      },

      sendJson(o) {
        this.headers.set('Content-Type', 'application/json');
        return this.send(o===undefined ? undefined : JSON.stringify(o))
      },

      sendText(o) {
        this.headers.set('Content-Type', 'text/plain');
        return this.send(String(o))
      },

      sendBlob(o) {
        !o.type && this.headers.set('Content-Type', 'application/octet-stream');
        
        return this.send(o)
        // return this.send(new Blob(['tomer', 'tomer2', 'tomer', 'tomer2', 'tomer', 'tomer2'], {type:'application/tomer'}))
      },

      sendArrayBuffer(o) {
        this.headers.set('Content-Type', 'application/octet-stream')
        return this.send(o)
      },
 
      sendSearchParams(o) {
        this.headers.set('Content-Type', 'application/x-www-form-urlencoded')
        return this.send(o)
      },

      sendFormData(o) {
        this.headers.set('Content-Type', 'application/x-www-form-urlencoded')
        return this.send(o)
      },

      setStatus(code=200, text) {
        this.status = code;
        this.statusText = text ?? STATUS_CODES[code.toString()];
        return this
      }

    }

    await this._polka.handler(request, polka_response);

    // console.log('polka_response.body ', polka_response.body);

    const response_web = new Response(
      polka_response.body, {
        headers: polka_response.headers,
        status: polka_response.status, 
        statusText: polka_response.statusText
      }
    )

    return await this.#_platform.handleResponse(response_web, context);
  }

}


