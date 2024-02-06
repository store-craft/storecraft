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
   * 
   * @typedef {import('./types.public.js').PlatformAdapter<PlatformNativeRequest, PlatformContext, H>} PlatformAdapter
   * @param {PlatformAdapter} platform platform
   * @param {import('./types.public.js').db_driver} db_driver database driver
   */
  constructor(platform, db_driver) {

    this._platform = platform;
    this._db_driver = db_driver;
  }

  async init() {
    try{
      await this.db.init(this)
    } catch (e) {
      console.error(e)
    }
    this._polka = create_api(this);
  }

  /**
   * Get the Polka router
   */
  get db() {
    return this._db_driver;
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
    return this._platform
  }

  hello = () => {}

  /**
   * Process a request with context in the native platform
   * 
   * @param {PlatformNativeRequest} req
   * @param {PlatformContext} context 
   */
  handler = async (req, context) => {
    const request = await this._platform.encode(req)
    
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
        this.headers.set('Content-Type', 'text/plain')
        return this.send(String(o))
      },

      sendBlob(o) {
        this.headers.set('Content-Type', 'application/octet-stream')
        return this.send(o)
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

    return await this._platform.handleResponse(response_web, context);
  }

}


