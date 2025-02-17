/** 
 * @import { StorecraftConfig } from "./types.public.js";
 * @import { OrderData } from "./api/types.public.js";
 * @import { storage_driver } from "./storage/types.public.js";
 * @import { db_driver } from "./database/types.public.js";
 * @import { payment_gateway } from "./payments/types.public.js";
 * @import { extension } from "./extensions/types.public.js";
 * @import { 
 *  InferPlatformContext, InferPlatformNativeRequest, 
 *  InferPlatformNativeResponse, PlatformAdapter 
 * } from "./platform/types.public.js";
 * @import { mailer } from "./mailer/types.public.js";
 * @import { tax_provider } from "./tax/types.public.js";
 * @import { PayloadForUpsert, PubSubOnEvents } from "./pubsub/types.public.js";
 * @import { ApiResponse } from "./rest/types.public.js";
 * @import { AI } from "./ai/core/types.private.js";
 * 
 */
import { STATUS_CODES } from './polka/codes.js';
import { create_rest_api } from './rest/index.js';
import { create_api, enums } from './api/index.js'
import { PubSub } from './pubsub/public.js';
import { UniformTaxes } from './tax/public.js';
export * from './api/types.api.enums.js'
import pkg from './package.json' with { type: "json" }
import { NotificationsExtension } from './extensions/notifications/index.js';
import { StoreAgent } from './ai/agents/agent.js';

/**
 * @typedef {{
 *  'notifications': NotificationsExtension
 * }} BaseExtensions
 */

/**
 * 
 * @template {PlatformAdapter} [Platform=PlatformAdapter]
 * @template {db_driver} [Database=db_driver]
 * @template {storage_driver} [Storage=storage_driver]
 * @template {mailer} [Mailer=mailer]
 * @template {Record<string, payment_gateway>} [PaymentMap=Record<string, payment_gateway>] 
 * `payments` map type
 * @template {Record<string, extension>} [ExtensionsMap=BaseExtensions]
 * `extensions` map type
 * @template {tax_provider} [Taxes=UniformTaxes]
 * @template {AI} [AiProvider=AI]
 * 
 * @description This is the main `storecraft` **App**
 * 
 */
export class App {

  /** 
   * @type {Platform} 
   */
  #_platform;

  /** 
   * @type {StoreAgent<AiProvider>} 
   */
  #_ai;
  
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
   * 
   * @type {Storage} 
   */ 
  #_storage;

  /** 
   * 
   * @description The mailer driver
   * 
   * @type {Mailer} 
   */ 
  #_mailer;

  /** 
   * 
   * @description The taxes driver
   * 
   * @type {Taxes} 
   */ 
  #_taxes;

  /** 
   * 
   * @description The payment gateways
   * 
   * @type {PaymentMap} 
   */ 
  #_payment_gateways;

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
   * @param {StorecraftConfig} [config] config The Storecraft Application config
   */
  constructor(
    config
  ) {
    this.#_config = config;
    this.#_is_ready = false;
    this.#_pubsub = new PubSub(this);
    // @ts-ignore
    this.#_taxes = new UniformTaxes(0);
    // @ts-ignore
    this.#_extensions = {
      'notifications': new NotificationsExtension()
    }

    // add extra events for orders state
    this.pubsub.on(
      'orders/upsert',
      async (event) => {
        const order_after = event.payload.current;
        const order_before = event.payload.previous;

        // test if the checkout now has turned complete
        const has_checkout_updated = (
          order_before?.status?.checkout?.id!==order_after.status.checkout.id
        );

        const has_fulfillment_updated = (
          order_before?.status?.fulfillment?.id!==order_after.status.fulfillment.id
        );

        const has_payment_updated = (
          order_before?.status?.payment?.id!==order_after.status.payment.id
        );

        /** @type {PayloadForUpsert<Partial<OrderData>>} */
        const payload = {
          previous: order_before,
          current: order_after
        }

        // console.log('from app', event.payload.current.status)
        // console.log('has_checkout_updated', has_checkout_updated)

        if(has_checkout_updated) {
          await this.pubsub.dispatch(
            `orders/checkout/${order_after.status.checkout.name2}`,
            payload
          );
          await this.pubsub.dispatch('orders/checkout/update', payload);
        }

        if(has_fulfillment_updated) {
          await this.pubsub.dispatch(
            `orders/fulfillment/${order_after.status.fulfillment.name2}`,
            payload
          );
          await this.pubsub.dispatch('orders/fulfillment/update', payload);
        }

        if(has_payment_updated) {
          await this.pubsub.dispatch(
            `orders/payments/${order_after.status.payment.name2}`,
            payload
          );
          await this.pubsub.dispatch('orders/payments/update', payload);
        }
      }
    );

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
                  env.SC_AUTH_SECRET_ACCESS_TOKEN ?? 'SC_AUTH_SECRET_ACCESS_TOKEN',
      auth_secret_refresh_token: c?.auth_secret_refresh_token ?? 
                  env.SC_AUTH_SECRET_REFRESH_TOKEN ?? 'SC_AUTH_SECRET_REFRESH_TOKEN',
      auth_admins_emails: c?.auth_admins_emails ??  
                  env.SC_AUTH_ADMINS_EMAILS?.split(',').map(
                    s => s.trim()).filter(Boolean) ?? [],
      // @ts-ignore
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
      general_forgot_password_confirm_base_url: c?.general_forgot_password_confirm_base_url ?? 
                  env.SC_GENERAL_STORE_FORGOT_PASSWORD_CONFIRM_BASE_URL,
    
    }
  } 

  print_banner(host='', version=(pkg.version??'1.0.0')) {
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
  ${c.red}Dashboard:      ${c.reset + host}/api/dashboard    
  ${c.red}API Reference:  ${c.reset + host}/api/reference    
  ${c.red}Website:        ${c.reset}https://storecraft.app
  ${c.red}GitHub:         ${c.reset}https://github.com/store-craft/storecraft
      `
  
    console.log(final);
  }

  /**
   * @param {boolean} [print_banner=true] 
   * @description Initialize the Application
   */
  async init(print_banner=true) {
    if(this.ready) 
      return Promise.resolve(this);
    
    /** @type {App} */
    const app = (/** @type {never} */ (this));

    try{
      // first let's settle config
      this.#settle_config_after_init();
      await this.db.init(app);
      this.storage && await this.storage.init(app);
      this.api = create_api(app);
      this.#_rest_controller = create_rest_api(app, this.config);
      this.#_is_ready = true;
  
      // settle extensions
      for(const ext_handle in this.extensions) {
        const ext = this.extension(ext_handle);
        ext?.onInit(app);
      }

      // settle ai agent
      if(this.#_ai) {
        this.#_ai.init(this);
      }

  
    } catch (e) {
      this.#_is_ready = false;

      console.log(e);
      
      throw e;
    } finally {
      print_banner && this.print_banner();
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
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {PlatformAdapter} P
   * 
   * @param {P} platform 
   * 
   * @returns {App<P, Database, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider>}
   * 
   */
  withPlatform(platform) {
    // @ts-ignore
    this.#_platform = platform;

    // @ts-ignore
    return this;
  } 

  /** 
   * 
   * @description Get the native platform object 
   */
  get platform() { 
    return this.#_platform; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {AI} P
   * 
   * @param {P} ai 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, P>}
   * 
   */
  withAI(ai) {
    // @ts-ignore
    this.#_ai = new StoreAgent({ ai });

    // @ts-ignore
    return this;
  } 

  /** 
   * 
   * @description Get the AI provider
   */
  get ai() { 
    return this.#_ai; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {db_driver} D
   * 
   * @param {D} database 
   * 
   * @returns {App<Platform, D, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider>}
   */
  withDatabase(database) {
    // @ts-ignore
    this.#_db_driver = database;

    // @ts-ignore
    return this;
  }   

  /** 
   * 
   * @description Get the Database driver 
   */
  get db() { 
    return this.#_db_driver; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {storage_driver} S
   * 
   * @param {S} storage 
   * 
   * @returns {App<Platform, Database, S, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider>}
   */
  withStorage(storage) {
    // @ts-ignore
    this.#_storage = storage;

    // @ts-ignore
    return this;
  }   

  /** 
   * 
   * @description Get the native storage object 
   */
  get storage() { 
    return this.#_storage; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {mailer} M
   * 
   * @param {M} mailer 
   * 
   * @returns {App<Platform, Database, Storage, M, PaymentMap, ExtensionsMap, Taxes, AiProvider>}
   */
  withMailer(mailer) {
    // @ts-ignore
    this.#_mailer = mailer;

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
   * @description Update new tax provider
   * 
   * @template {tax_provider} T
   * 
   * @param {T} taxes 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, T, AiProvider>}
   */
  withTaxes(taxes) {
    // @ts-ignore
    this.#_taxes = taxes;

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * @description Get the taxes provider
   */
  get taxes() { 
    return this.#_taxes; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {Record<string, payment_gateway>} N
   * 
   * @param {N} gateways 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, N, ExtensionsMap, Taxes, AiProvider>}
   */
  withPaymentGateways(gateways) { 
    // @ts-ignore
    this.#_payment_gateways = gateways; 

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * @description Get the payment gateways 
   */
  get gateways() { 
    return this.#_payment_gateways; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {Record<string, extension<any, this & App>>} E
   * 
   * @param {E} extensions 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, E & BaseExtensions, Taxes, AiProvider>}
   */
  withExtensions(extensions) { 
    // @ts-ignore
    this.#_extensions = {
      ...this.#_extensions,
      ...extensions
    }; 

    // @ts-ignore
    return this;
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
   * @param {InferPlatformNativeRequest<Platform>} req
   * @param {InferPlatformContext<Platform>} [context] 
   * 
   * @returns {Promise<InferPlatformNativeResponse<Platform>>}
   */
  handler = async (req, context) => {
    context = context ?? {};
    const start_millis = Date.now();
    const request = await this.#_platform.encode(req, context);
    
    /** @type {ApiResponse} */
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
        if(typeof code === 'string')
          code = 400;
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
      'put': `\x1b[1;44;37mPUT\x1b[0m`,
      'PUT': `\x1b[1;44;37mPUT\x1b[0m`,
      'patch': `\x1b[1;44;37mPATCH\x1b[0m`,
      'PATCH': `\x1b[1;44;37mPATCH\x1b[0m`,
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
   * @type {PubSubOnEvents<this, this>["on"]}
   */
  on = (event, callback) => {
    this.pubsub.on(event, callback);

    return this;
  }

}
