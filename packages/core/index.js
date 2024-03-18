import { STATUS_CODES } from './v-polka/codes.js';
import { create_rest_api } from './v-rest/index.js';
export * from './v-api/types.api.enums.js'

/** 
 * @typedef {Partial<import('./types.public.js').Config>} Config
 * @typedef {import('./v-storage/types.storage.js').storage_driver} storage_driver
 * @typedef {import('./v-database/types.public.js').db_driver} db_driver
 * @typedef {import('./v-payments/types.payments.js').payment_gateway} payment_gateway
 * @typedef {import('./v-mailer/types.mailer.js').mailer} mailer
 */

/** @param {string} s @param {number} def */
const parse_int = (s, def) => {
  const parsed = parseInt(s); // can be NaN
  return parsed ? parsed : def;
}

/**
 * @template {any} [PlatformNativeRequest=any]
 * @template {any} [PlatformContext=any]
 * @template {any} [H=any]
 * @template {db_driver} [D=db_driver]
 * @template {storage_driver} [S=storage_driver]
 */
export class App {

  /** 
   * @typedef {import('./v-platform/types.public.js').PlatformAdapter<
   * PlatformNativeRequest, PlatformContext, H>
   * } Platform
   * @type {Platform} 
   */
  #_platform;
  /** 
   * The private database driver
   * @type {D} 
   **/ 
  #_db_driver;

  /** 
   * The private storage driver
   * @type {S} 
   **/ 
  #_storage;

  /** 
   * The payment gateways
   * 
   * @type {Record<string, payment_gateway>} 
   **/ 
  #_payment_gateways;

  /** 
   * The mailer driver
   * @type {mailer} 
   **/ 
  #_mailer;

  /** 
   * The Storecraft App Config
   * @type {Config} 
   **/ 
  #_config;

  /** 
   * The REST API controller
   * @type {ReturnType<create_rest_api>} 
   **/ 
  #_rest_controller;

  /** 
   * Flag for app is ready 
   * @type {boolean} 
   **/ 
  #_is_ready;

  /**
   * 
   * @param {Platform} platform platform The Platform driver
   * @param {D} db_driver datatbase The Database driver
   * @param {S} [storage] storage The storage driver
   * @param {Record<string, payment_gateway>} [payment_gateways] The Payment Gateways
   * @param {mailer} [mailer] mailer The Email driver
   * @param {Config} [config] config The Storecraft Application config
   */
  constructor(platform, db_driver, storage, payment_gateways, mailer, config) {

    this.#_platform = platform;
    this.#_db_driver = db_driver;
    this.#_storage = storage;
    this.#_payment_gateways = payment_gateways;
    this.#_mailer = mailer;
    this.#_config = config;
    this.#_is_ready = false;
  }

  /**
   * After init, we inspect for missing config values and try to 
   * find them in platform environment.
   */
  #settle_config_after_init() {
    if(!this.platform)
      return;
    const c = this.#_config;
    const env = this.platform.env;
    this.#_config = {
      ...c,
      auth_secret_access_token: c?.auth_secret_access_token ?? 
                  env.SC_AUTH_SECRET_ACCESS_TOKEN,
      auth_secret_refresh_token: c?.auth_secret_refresh_token ?? 
                  env.SC_AUTH_SECRET_REFRESH_TOKEN,
      auth_password_hash_rounds: c?.auth_password_hash_rounds ?? 
                parse_int(env.SC_AUTH_PASS_HASH_ROUNDS, 1000),
      admins_emails: c?.admins_emails ?? 
              env.SC_ADMINS_EMAILS?.split(',').map(
                s => s.trim()).filter(Boolean) ?? []
    }

    console.log('store-craft config', this.#_config);
  }

  /**
   * 
   * Initialize the Application
   */
  async init() {
    try{
      // first let's settle config
      this.#settle_config_after_init();

      await this.db.init(this);
      this.storage && await this.storage.init(this)
    } catch (e) {
      console.error(e)
    }
    // this._polka = create_api(this);
    this.#_rest_controller = create_rest_api(this);
    this.#_is_ready = true;
    return this;
  }

  /** 
   * 
   * Get the REST API controller 
   **/
  get rest_api() { 
    return this.#_rest_controller; 
  }

  /** 
   * 
   * Get the Database driver 
   **/
  get db() { 
    return this.#_db_driver; 
  }

  /** 
   * 
   * Get the native platform object 
   **/
  get platform() { 
    return this.#_platform; 
  }

  /** 
   * 
   * Get the native storage object 
   **/
  get storage() { 
    return this.#_storage; 
  }

  /** 
   * 
   * Get the payment gateways 
   **/
  get gateways() { 
    return this.#_payment_gateways; 
  }

  /** 
   * 
   * Mailer driver 
   **/
  get mailer() { 
    return this.#_mailer; 
  }

  /** 
   * Config 
   **/
  get config() { 
    return this.#_config; 
  }

  /**
   * Is the app ready ?
   */
  get ready() { 
    return this.#_is_ready; 
  }

  /**
   * Get a payment gateway by handle
   * 
   * @param {string} handle 
   */
  gateway = (handle) => {
    return this.gateways?.[handle];
  }

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

      sendReadableStream(o) {
        return this.send(o);
      },

      sendJson(o) {
        this.headers.set('Content-Type', 'application/json');
        return this.send(o===undefined ? undefined : JSON.stringify(o))
      },

      sendHtml(o) {
        this.headers.set('Content-Type', 'text/html');
        return this.send(String(o));
      },

      sendText(o) {
        this.headers.set('Content-Type', 'text/plain');
        return this.send(String(o))
      },

      sendBlob(o) {
        !o.type && this.headers.set('Content-Type', 'application/octet-stream');
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
        this.headers.set('Content-Type', 'multipart/form-data')
        return this.send(o)
      },

      setStatus(code=200, text) {
        this.status = code;
        this.statusText = text ?? STATUS_CODES[code.toString()];
        return this
      }

    }

    console.log(request.url)

    await this.rest_api.handler(request, polka_response);
    // await this._polka.handler(request, polka_response);

    // console.log('polka_response.body ', polka_response.body);

    const response_web = new Response(
      polka_response.body, {
        headers: polka_response.headers,
        status: polka_response.status, 
        statusText: polka_response.statusText
      }
    )

    return this.#_platform.handleResponse(
      response_web, context
    );
  }

}


