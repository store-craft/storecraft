/** 
 * @import { ENV, StorecraftConfig } from "./types.public.js";
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
 * @import { ChatAI, VectorStore } from "./ai/core/types.private.js";
 * @import { AuthProvider } from "./auth/types.js";
 * 
 */
import { STATUS_CODES } from './rest/polka/codes.js';
import { create_rest_api } from './rest/index.js';
import { create_api, enums } from './api/index.js'
import { PubSub } from './pubsub/index.js';
import { UniformTaxes } from './tax/public.js';
export * from './api/types.api.enums.js'
import pkg from './package.json' with { type: "json" }
import { NotificationsExtension } from './extensions/notifications/index.js';
import { StoreAgent } from './ai/agents/agent.js';
import { 
  save_collection, save_discount, save_product, save_shipping_method 
} from './ai/models/vector-stores/index.js';

/**
 * @typedef {{
 *  'notifications': NotificationsExtension,
 *  [h: string]: extension
 * }} BaseExtensions
 */

let ms_init_start = 0;

/**
 * @description This is the main `storecraft` **App**
 * 
 * @template {PlatformAdapter} [Platform=PlatformAdapter]
 * @template {db_driver} [Database=db_driver]
 * @template {storage_driver} [Storage=storage_driver]
 * @template {mailer} [Mailer=mailer]
 * @template {Record<string, payment_gateway>} [PaymentMap=Record<string, payment_gateway>] 
 * `payments` map type
 * @template {BaseExtensions} [ExtensionsMap=BaseExtensions]
 * `extensions` map type
 * @template {tax_provider} [Taxes=tax_provider]
 * @template {ChatAI} [AiProvider=ChatAI]
 * @template {VectorStore} [VectorStoreProvider=VectorStore]
 * @template {Record<string, AuthProvider>} [AuthProvidersMap=Record<string, AuthProvider>]
 */
export class App {

  /** @satisfies {ENV<StorecraftConfig>} */
  static EnvConfig = /** @type{const} */ ({
    auth_admins_emails: 'SC_AUTH_ADMIN_EMAILS',
    auth_secret_access_token: 'SC_AUTH_SECRET_ACCESS_TOKEN',
    auth_secret_refresh_token: 'SC_AUTH_SECRET_REFRESH_TOKEN',
    checkout_reserve_stock_on: 'SC_CHECKOUT_RESERVE_STOCK_ON',
    general_confirm_email_base_url: 'SC_GENERAL_STORE_CONFIRM_EMAIL_BASE_URL',
    general_forgot_password_confirm_base_url: 'SC_GENERAL_STORE_FORGOT_PASSWORD_CONFIRM_BASE_URL',
    general_store_description: 'SC_GENERAL_STORE_DESCRIPTION',
    general_store_logo_url: 'SC_GENERAL_STORE_LOGO_URL',
    general_store_name: 'SC_GENERAL_STORE_NAME',
    general_store_support_email: 'SC_GENERAL_STORE_SUPPORT_EMAIL',
    general_store_website: 'SC_GENERAL_STORE_WEBSITE',
    storage_rewrite_urls: 'SC_STORAGE_REWRITE_URLS'
  });

  /** 
   * @type {Platform} 
   */
  #platform;

  /** 
   * @type {StoreAgent<AiProvider>} 
   */
  #ai;

  /**
   * @type {AuthProvidersMap}
   */
  #auth_providers;

  /** 
   * @type {VectorStoreProvider} 
   */
  #vector_store;
  
  /** 
   * 
   * @description The private database driver
   * 
   * 
   * @type {Database} 
   */ 
  #db_driver;

  /** 
   * 
   * @description The private storage driver
   * 
   * @type {Storage} 
   */ 
  #storage;

  /** 
   * 
   * @description The mailer driver
   * 
   * @type {Mailer} 
   */ 
  #mailer;

  /** 
   * 
   * @description The taxes driver
   * 
   * @type {Taxes} 
   */ 
  #taxes;

  /** 
   * 
   * @description The payment gateways
   * 
   * @type {PaymentMap} 
   */ 
  #payment_gateways;

  /** 
   * 
   * @description The extensions
   * 
   * @type {ExtensionsMap} 
   */ 
  #extensions;

  /**
   * @description The app's pubsub system
   * 
   * @type {PubSub<App>}
   */
  #pubsub;

  /** 
   * @description The Storecraft App Config
   * 
   * @type {StorecraftConfig} 
   */ 
  #config;

  /** 
   * @description The REST API controller
   * 
   * @type {ReturnType<typeof create_rest_api>} 
   */ 
  #rest_controller;

  /** 
   * @description Flag for app is ready 
   * 
   * @type {boolean} 
   */ 
  #is_ready;

  /**
   * 
   * @param {StorecraftConfig} [config] config The Storecraft Application config
   */
  constructor(
    config={}
  ) {
    ms_init_start = Date.now();
    this.#config = config;
    this.#is_ready = false;
    // @ts-ignore
    this.#taxes = new UniformTaxes(0);
    // @ts-ignore
    this.#extensions = {
      'notifications': new NotificationsExtension()
    }
    
    // @ts-ignore
    this.#pubsub = new PubSub(this);
    
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

        /** @type {PayloadForUpsert<OrderData>} */
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
    if(!this.platform) {
      throw new Error('Storecraft:: No Platform Found !!')
    }

    const env = this.platform.env;

    this.#config = {
      auth_secret_access_token: env[App.EnvConfig.auth_secret_access_token],
      auth_secret_refresh_token: env[App.EnvConfig.auth_secret_refresh_token],
      auth_admins_emails: env[App.EnvConfig.auth_admins_emails]?.split(',')
        .map(s => s.trim()).filter(Boolean) ?? [],
      // @ts-ignore
      checkout_reserve_stock_on: env[App.EnvConfig.checkout_reserve_stock_on] ?? 'never',
      storage_rewrite_urls: env[App.EnvConfig.storage_rewrite_urls],
      general_store_name: env[App.EnvConfig.general_store_name],
      general_store_website: env[App.EnvConfig.general_store_website],
      general_store_description: env[App.EnvConfig.general_store_description],
      general_store_support_email: env[App.EnvConfig.general_store_support_email],
      general_store_logo_url: env[App.EnvConfig.general_store_logo_url],
      general_confirm_email_base_url: env[App.EnvConfig.general_confirm_email_base_url],
      general_forgot_password_confirm_base_url: env[
        App.EnvConfig.general_forgot_password_confirm_base_url
      ],
      ...this.config,
    }
  } 

  print_banner(host='', version=(pkg.version ?? '1.0.0')) {
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
  ${c.yellow}Statistics:     ${c.reset}initialized in ${(Date.now() - ms_init_start)}ms
      `;

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

      // settle database
      this.db?.init?.(app);

      // settle storage
      this.storage?.init?.(app);

      // settle programmatic API
      this.api = create_api(app);
      // settle REST-API
      this.#rest_controller = create_rest_api(app, this.config);
  
      // settle extensions
      for(const ext_handle in this.extensions) {
        const ext = this.extension(ext_handle);
        ext?.onInit?.(app);
      }

      // settle payment gateways
      for(const handle in this.gateways) {
        const gateway = this.gateway(handle);
        gateway?.onInit?.(app);
      }

      // settle payment gateways
      for(const handle in this.auth_providers) {
        const ap = this.auth_providers[handle];
        ap?.init?.(app);
      }

      // settle ai agent
      if(this.#ai) {
        this.#ai.init(app);
      }

      // settle vector store events
      if(this.vectorstore) {
        this.vectorstore.onInit(app);
        this.vectorstore?.embedder?.onInit(app);
        this.pubsub.on(
          'products/upsert',
          async (evt) => {
            await save_product(evt.payload.current, this.vectorstore);
          }
        );

        this.pubsub.on(
          'collections/upsert',
          async (evt) => {
            await save_collection(evt.payload.current, this.vectorstore);
          }
        );

        this.pubsub.on(
          'discounts/upsert',
          async (evt) => {
            await save_discount(evt.payload.current, this.vectorstore);
          }
        );

        this.pubsub.on(
          'shipping/upsert',
          async (evt) => {
            await save_shipping_method(evt.payload.current, this.vectorstore);
          }
        );

      }

      // settle mailer
      this.mailer?.onInit?.(app);
  
      this.#is_ready = true;

    } catch (e) {
      this.#is_ready = false;

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
    return this.#rest_controller; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {PlatformAdapter} P
   * 
   * @param {P} platform 
   * 
   * @returns {App<P, Database, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   * 
   */
  withPlatform(platform) {
    // @ts-ignore
    this.#platform = platform;

    // @ts-ignore
    return this;
  } 

  /** 
   * 
   * @description Get the native platform object 
   */
  get platform() { 
    return this.#platform; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {ChatAI} P
   * 
   * @param {P} ai 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, P, VectorStoreProvider, AuthProvidersMap>}
   * 
   */
  withAI(ai) {
    // @ts-ignore
    this.#ai = new StoreAgent({ ai });

    // @ts-ignore
    return this;
  } 

  /** 
   * 
   * @description Get the AI provider
   */
  get ai() { 
    return this.#ai; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {VectorStore} P
   * 
   * @param {P} store 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider, P, AuthProvidersMap>}
   * 
   */
  withVectorStore(store) {
    // @ts-ignore
    this.#vector_store = store;

    // @ts-ignore
    return this;
  } 

  /** 
   * 
   * @description Get the Vector Store
   */
  get vectorstore() { 
    return this.#vector_store; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {db_driver} D
   * 
   * @param {D} database 
   * 
   * @returns {App<Platform, D, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   */
  withDatabase(database) {
    // @ts-ignore
    this.#db_driver = database;

    // @ts-ignore
    return this;
  }   

  /** 
   * 
   * @description Get the Database driver 
   */
  get db() { 
    return this.#db_driver; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {storage_driver} S
   * 
   * @param {S} storage 
   * 
   * @returns {App<Platform, Database, S, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   */
  withStorage(storage) {
    // @ts-ignore
    this.#storage = storage;

    // @ts-ignore
    return this;
  }   

  /** 
   * 
   * @description Get the native storage object 
   */
  get storage() { 
    return this.#storage; 
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * 
   * @template {mailer} M
   * 
   * @param {M} mailer 
   * 
   * @returns {App<Platform, Database, Storage, M, PaymentMap, ExtensionsMap, Taxes, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   */
  withMailer(mailer) {
    // @ts-ignore
    this.#mailer = mailer;

    // @ts-ignore
    return this;
  }   

  /** 
   * 
   * @description Mailer driver 
   */
  get mailer() { 
    return this.#mailer; 
  }

  /** 
   * @description Update new tax provider
   * 
   * @template {tax_provider} T
   * 
   * @param {T} taxes 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, T, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   */
  withTaxes(taxes) {
    // @ts-ignore
    this.#taxes = taxes;

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * @description Get the taxes provider
   */
  get taxes() { 
    return this.#taxes; 
  }

  /** 
   * @description Add payment gateways
   * 
   * @template {Record<string, payment_gateway>} N
   * 
   * @param {N} gateways 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, N, ExtensionsMap, Taxes, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   */
  withPaymentGateways(gateways) { 
    // @ts-ignore
    this.#payment_gateways = gateways; 

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * @description Get the payment gateways 
   */
  get gateways() { 
    return this.#payment_gateways; 
  }

  /** 
   * @description Add custom extensions
   * 
   * @template {Record<string, extension>} E
   * 
   * @param {E} extensions 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, E & BaseExtensions, Taxes, AiProvider, VectorStoreProvider, AuthProvidersMap>}
   */
  withExtensions(extensions) { 
    // @ts-ignore
    this.#extensions = {
      ...this.#extensions,
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
    return this.#extensions; 
  }

  /** 
   * @description Add Auth Providers for social login
   * 
   * @template {Record<string, AuthProvider>} A
   * 
   * @param {A} providers 
   * 
   * @returns {App<Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, AiProvider, VectorStoreProvider, A>}
   */
  withAuthProviders(providers) { 
    // @ts-ignore
    this.#auth_providers = providers;

    // @ts-ignore
    return this;
  }

  /** 
   * 
   * @description extensions
   */
  get auth_providers() { 
    return this.#auth_providers; 
  }

  /** 
   * @description Pub-Sub `events` module 
   */
  get pubsub() { 
    return this.#pubsub; 
  }


  /** 
   * @description Config 
   */
  get config() { 
    return this.#config; 
  }

  /**
   * @description Is the app ready ?
   */
  get ready() { 
    return this.#is_ready; 
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
    // @ts-ignore
    context = context ?? {};
    const start_millis = Date.now();
    const request = await this.#platform.encode(req, context);
    
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

      sendServerSentEvents(o) {
        this.headers.append('Content-Type', 'text/event-stream');
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

    const response = await this.#platform.handleResponse(
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
   * @type {PubSub["on"]}
   */
  on = (event, callback) => {
    this.pubsub.on(event, callback);

    // @ts-ignore
    return this;
  }

}
