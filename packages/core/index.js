import { STATUS_CODES } from './v-polka/codes.js';
import { create_rest_api } from './v-rest/index.js';
export * from './types.api.enums.js'

/** 
 * @typedef {import('./types.public.js').Config} Config
 * @typedef {import('./types.storage.js').storage_driver} storage_driver
 * @typedef {import('./types.database.js').db_driver} db_driver
 * @typedef {import('./types.payments.js').payment_gateway} payment_gateway
 * @typedef {import('./types.mailer.js').mailer} mailer
 */

/** @param {string} s @param {number} def */
const parse_int = (s, def) => {
  const parsed = parseInt(s); // can be NaN
  return parsed ? parsed : def;
}

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
  /** @type {db_driver} */ #_db_driver;
  /** @type {storage_driver} */ #_storage;
  /** @type {Record<string, payment_gateway>} */ #_payment_gateways;
  /** @type {mailer} */ #_mailer;
  /** @type {Config} */ #_config;
  /** @type {ReturnType<create_rest_api>} */ #_rest_controller;

  /**
   * 
   * @param {Platform} platform platform
   * @param {db_driver} db_driver datatbase
   * @param {storage_driver} [storage] storage
   * @param {Record<string, payment_gateway>} [payment_gateways] payment gateways
   * @param {mailer} [mailer] mailer 
   * @param {Config} [config] config
   */
  constructor(platform, db_driver, storage, payment_gateways, mailer, config) {

    this.#_platform = platform;
    this.#_db_driver = db_driver;
    this.#_storage = storage;
    this.#_payment_gateways = payment_gateways;
    this.#_mailer = mailer;
    this.#_config = config;
  }

  /**
   * After init, we inspect for missing config values and try to 
   * find them in platform environment.
   */
  #settle_config_after_init() {
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

  async init() {
    try{
      // first let's settle config
      this.#settle_config_after_init();

      await this.db.init(this)
      await this.storage.init(this)
    } catch (e) {
      console.error(e)
    }
    // this._polka = create_api(this);
    this.#_rest_controller = create_rest_api(this);
    return this;
  }

  /** Get the REST API controller */
  get rest_api() { return this.#_rest_controller; }
  /** Get the Polka router */
  get db() { return this.#_db_driver; }
  /** Get the native platform object */
  get platform() { return this.#_platform; }
  /** Get the native storage object */
  get storage() { return this.#_storage; }
  /** Get the payment gateways */
  get gateways() { return this.#_payment_gateways; }
  /** Mailer driver */
  get mailer() { return this.#_mailer; }
  /** Config */
  get config() { return this.#_config; }

  /**
   * Get a payment gateway by handle
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


