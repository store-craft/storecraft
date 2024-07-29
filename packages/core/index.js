import { STATUS_CODES } from './v-polka/codes.js';
import { create_rest_api } from './v-rest/index.js';
import { create_api } from './v-api/index.js'
import { PubSub } from './v-pubsub/public.js';
export * from './v-api/types.api.enums.js'
import pkg from './package.json' assert { type: "json" }

/** 
 * @typedef {Partial<import('./types.public.js').StorecraftConfig>} StorecraftConfig
 * @typedef {import('./v-storage/types.storage.js').storage_driver} storage_driver
 * @typedef {import('./v-database/types.public.js').db_driver} db_driver
 * @typedef {import('./v-payments/types.payments.js').payment_gateway} payment_gateway
 * @typedef {import('./v-extensions/types.public.js').extension} extension
 * @typedef {import('./v-mailer/types.mailer.js').mailer} mailer
 */

/** @param {string} s @param {number} def */
const parse_int = (s, def) => {
  const parsed = parseInt(s); // can be NaN
  return parsed ? parsed : def;
}


/**
 * 
 * @template {any} [PlatformNativeRequest=any]
 * @template {any} [PlatformContext=any]
 * @template {any} [H=any]
 * @template {db_driver} [Database=db_driver]
 * @template {storage_driver} [Storage=storage_driver]
 * @template {Record<string, payment_gateway>} [PaymentMap=Record<string, payment_gateway>] 
 * `payments` map type
 * @template {Record<string, extension>} [ExtensionsMap=Record<string, extension>] 
 * `extensions` map type
 * 
 * @description This is the main `storecraft` **App**
 * 
 */
export class App {

  /** 
   * 
   * @typedef {import('./v-platform/types.public.js').PlatformAdapter<
   *  PlatformNativeRequest, PlatformContext, H>
   * } Platform
   * 
   * @type {Platform} 
   */
  #_platform;

  /** 
   * 
   * @description The private database driver
   * 
   * 
   * @type {Database} 
   */ 
  #_db_driver;

  /** 
   * 
   * @description The private storage driver
   * @type {Storage} 
   */ 
  #_storage;

  /** 
   * 
   * @description The payment gateways
   * 
   * @type {PaymentMap} 
   */ 
  #_payment_gateways;

  /** 
   * 
   * @description The mailer driver
   * 
   * @type {mailer} 
   */ 
  #_mailer;

  /** 
   * 
   * @description The extensions
   * 
   * @type {ExtensionsMap} 
   */ 
  #_extensions;

  /**
   * @description The app's pubsub system
   * 
   * @type {PubSub}
   */
  #_pubsub;

  /** 
   * @description The Storecraft App Config
   * 
   * @type {StorecraftConfig} 
   */ 
  #_config;

  /** 
   * @description The REST API controller
   * 
   * @type {ReturnType<typeof create_rest_api>} 
   */ 
  #_rest_controller;

  /** 
   * @description Flag for app is ready 
   * 
   * @type {boolean} 
   */ 
  #_is_ready;

  /**
   * 
   * @param {Platform} platform platform The Platform driver
   * @param {Database} db_driver datatbase The Database driver
   * @param {Storage} [storage] storage The storage driver
   * @param {mailer} [mailer] mailer The Email driver
   * @param {StorecraftConfig} [config] config The Storecraft Application config
   */
  constructor(
    platform, db_driver, storage, mailer, config
  ) {

    this.#_platform = platform;
    this.#_db_driver = db_driver;
    this.#_storage = storage;
    this.#_mailer = mailer;
    this.#_config = config;
    this.#_is_ready = false;
  } 

  /**
   * @return {PaymentMap}
   */
  type_g() {
    return undefined;
  }

  /**
   * 
   * @description After init, we inspect for missing config values and try to 
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
      auth_admins_emails: c?.auth_admins_emails ??  
                  env.SC_AUTH_ADMINS_EMAILS?.split(',').map(
                    s => s.trim()).filter(Boolean) ?? [],
      checkout_reserve_stock_on: c?.checkout_reserve_stock_on ?? 
                  env.SC_CHECKOUT_RESERVE_STOCK_ON ?? 'never',
      storage_rewrite_urls: c?.storage_rewrite_urls ?? 
                  env.SC_STORAGE_REWRITE_URLS,
      general_store_name: c?.general_store_name ?? 
                  env.SC_GENERAL_STORE_NAME,
      general_store_website: c?.general_store_website ?? 
                  env.SC_GENERAL_STORE_WEBSITE,
      general_store_description: c?.general_store_description ?? 
                  env.SC_GENERAL_STORE_DESCRIPTION,
      general_store_support_email: c?.general_store_support_email ?? 
                  env.SC_GENERAL_STORE_SUPPORT_EMAIL,
      general_store_logo_url: c?.general_store_logo_url ?? 
                  env.SC_GENERAL_STORE_LOGO_URL,
      general_confirm_email_base_url: c?.general_confirm_email_base_url ?? 
                  env.SC_GENERAL_STORE_CONFIRM_EMAIL_BASE_URL,

    }
 
    console.log(this.#banner_create(pkg.version));
    // console.log('store-craft config', this.#_config);
  } 

  #banner_create(version='1.0.0') {
    const banner3 = '   _______________  ____  ______   __________  ___    ____________\r\n  \/ ___\/_  __\/ __ \\\/ __ \\\/ ____\/  \/ ____\/ __ \\\/   |  \/ ____\/_  __\/\r\n  \\__ \\ \/ \/ \/ \/ \/ \/ \/_\/ \/ __\/    \/ \/   \/ \/_\/ \/ \/| | \/ \/_    \/ \/   \r\n ___\/ \/\/ \/ \/ \/_\/ \/ _, _\/ \/___   \/ \/___\/ _, _\/ ___ |\/ __\/   \/ \/    \r\n\/____\/\/_\/  \\____\/_\/ |_\/_____\/   \\____\/_\/ |_\/_\/  |_\/_\/     \/_\/     \r\n                                                                  '
    const c = {
      red: '\x1b[1;31m',
      magenta: `\x1b[1;35m`,
      yellow: `\x1b[33m`,
      reset: `\x1b[0m`,
    }
  
    let final = c.magenta + '\n';
    final += banner3;
    final += `${c.red}\nv${version}`
    final += `\n
  ${c.red}Dashboard:      ${c.reset}/api/dashboard    
  ${c.red}API Reference:  ${c.reset}/api/reference    
  ${c.red}Website:        ${c.reset}https://storecraft.app
  ${c.red}GitHub:         ${c.reset}https://github.com/store-craft/storecraft
      `
  
    return final;
  }
  

  /**
   * 
   * @description Initialize the Application
   */
  async init() {
    this.#_pubsub = new PubSub(this);
    
    try{
      // first let's settle config
      this.#settle_config_after_init();

      await this.db.init(this);

      this.storage && await this.storage.init(this)
    } catch (e) {
      console.log(e)
    }

    // this.#_api = create_api(this);
    this.api = create_api(this);
    this.#_rest_controller = create_rest_api(this);
    this.#_is_ready = true;
    
    const app = this;

    // settle extensions
    for(const ext_handle in this.extensions) {
      const ext = this.extension(ext_handle);
      ext?.onInit(app);
    }

    return this;
  }

  /** 
   * 
   * @description Get the REST API controller 
   */
  get rest_controller() { 
    return this.#_rest_controller; 
  }

  /** 
   * 
   * @description Get the Database driver 
   */
  get db() { 
    return this.#_db_driver; 
  }

  /** 
   * 
   * @description Get the native platform object 
   */
  get platform() { 
    return this.#_platform; 
  }

  /** 
   * 
   * @description Get the native storage object 
   */
  get storage() { 
    return this.#_storage; 
  }

  /** 
   * 
   * @description Get the payment gateways 
   */
  get gateways() { 
    return this.#_payment_gateways; 
  }

  /** 
   * 
   * 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {Record<string, payment_gateway>} N
   * 
   * @param {N} gateways 
   * 
   * @returns {App<PlatformNativeRequest, PlatformContext, H, Database, Storage, N, ExtensionsMap>}
   */
  withPaymentGateways(gateways) { 
    // @ts-ignore
    this.#_payment_gateways = gateways; 

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {Record<string, extension>} E
   * 
   * @param {E} extensions 
   * 
   * @returns {App<PlatformNativeRequest, PlatformContext, H, Database, Storage, PaymentMap, E>}
   */
  withExtensions(extensions) { 
    // @ts-ignore
    this.#_extensions = extensions; 

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * @description Mailer driver 
   */
  get mailer() { 
    return this.#_mailer; 
  }

  /** 
   * 
   * @description extensions
   */
  get extensions() { 
    return this.#_extensions; 
  }

  /** 
   * @description Pub-Sub `events` module 
   */
  get pubsub() { 
    return this.#_pubsub; 
  }


  /** 
   * @description Config 
   */
  get config() { 
    return this.#_config; 
  }

  /**
   * @description Is the app ready ?
   */
  get ready() { 
    return this.#_is_ready; 
  }

  /**
   * @description Get a `payment gateway` by `handle`
   * 
   * @param {keyof PaymentMap} handle 
   */
  gateway = (handle) => {
    return this.gateways?.[handle];
  }

  /**
   * @description Get an `extension` by `handle`
   * 
   * @param {keyof ExtensionsMap} handle 
   */
  extension = (handle) => {
    return this.extensions?.[handle];
  }

  /**
   * @description Process a request with context in the native platform
   * 
   * @param {PlatformNativeRequest} req
   * @param {PlatformContext} context 
   */
  handler = async (req, context) => {
    const start_millis = Date.now();
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
  
    const c = {
      red: '\x1b[1;31m',
      green: '\x1b[1;32m',
      cyan: '\x1b[36m',
      magenta: `\x1b[1;35m`,
      yellow: `\x1b[33m`,
      reset: `\x1b[0m`,
    }

    const method_to_color = {
      'get': `\x1b[1;43;37mGET\x1b[0m`,
      'GET': `\x1b[1;43;37mGET\x1b[0m`,
      'post': `\x1b[1;44;37mPOST\x1b[0m`,
      'POST': `\x1b[1;44;37mPOST\x1b[0m`,
      'delete': `\x1b[1;41;37mDELETE\x1b[0m`,
      'DELETE': `\x1b[1;41;37mDELETE\x1b[0m`,
      'options': `\x1b[1;45;37mOPTIONS\x1b[0m`,
      'OPTIONS': `\x1b[1;45;37mOPTIONS\x1b[0m`,
    }

    await this.rest_controller.handler(request, polka_response);

    // console.log('polka_response.body ', polka_response.body);

    const response_web = new Response(
      polka_response.body, {
        headers: polka_response.headers,
        status: polka_response.status, 
        statusText: polka_response.statusText
      }
    )

    const response = await this.#_platform.handleResponse(
      response_web, context
    );

    {
      const delta = Date.now() - start_millis;
      const url = new URL(decodeURIComponent(request.url));
      const line = method_to_color[request.method] + 
        ' \x1b[33m' + 
        url.pathname.slice(0, 250) + 
        '\x1b[0m' + 
        ` (${delta}ms)`;
      const query = url.search
      console.log(line)
      if(query)
        console.log(c.cyan, query)
    }

    return response;
  }


  /**
   * @description Quickly attach an `event` subscriber. This is just a quick way
   * to interface into {@link PubSub}
   * 
   * @type {import('./v-pubsub/types.public.js').PubSubOnEvents<this, this>["on"]}
   */
  on = (event, callback) => {
    this.pubsub.on(event, callback);

    return this;
  }

}
