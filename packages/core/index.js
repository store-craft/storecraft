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
 * @import { 
 *  events, PayloadForUpsert, PubSubEvent, 
 *  PubSubSubscriber 
 * } from "./pubsub/types.public.js";
 * @import { ChatAI, VectorStore } from "./ai/core/types.private.js";
 * @import { Agent } from "./ai/agents/types.js";
 * @import { AuthProvider } from "./auth/types.js";
 * @import { OmitAppBuild, InitializedStorecraftApp } from "./types.public.js";
 */
import { create_rest_api } from './rest/index.js';
import { create_api } from './api/index.js'
import { PubSub } from './pubsub/index.js';
import { UniformTaxes } from './tax/public.js';
export * from './api/types.api.enums.js'
import pkg from './package.json' with { type: "json" }
import { 
  NotificationsExtension 
} from './extensions/notifications/index.js';
import { StoreAgent } from './ai/agents/index.js';
import { 
  save_collection, save_discount, 
  save_product, save_shipping_method 
} from './ai/models/vector-stores/index.js';
import { assert } from './api/utils.func.js';

/**
 * @typedef {{
 *  'notifications'?: NotificationsExtension,
 * }} BaseExtensions
 */

/**
 * @typedef {{
 *  'store'?: StoreAgent<any>,
* }} BaseAgents
 */

/**
 * @description This is the main `storecraft` **App**
 * @template {PlatformAdapter} [Platform=PlatformAdapter]
 * @template {db_driver} [Database=db_driver]
 * @template {storage_driver} [Storage=storage_driver]
 * @template {mailer} [Mailer=mailer]
 * @template {Record<string, payment_gateway>} [PaymentMap=Record<string, payment_gateway>] 
 * `payments` map type
 * @template {Record<string, extension<any>>} [ExtensionsMap=(Record<string, extension<any>> & BaseExtensions)]
 * `extensions` map type
 * @template {tax_provider} [Taxes=tax_provider]
 * @template {ChatAI} [AiProvider=ChatAI]
 * @template {VectorStore} [VectorStoreProvider=VectorStore]
 * @template {Record<string, Agent>} [AgentsMap=(Record<string, Agent> & BaseAgents)]
 * @template {Record<string, AuthProvider>} [AuthProvidersMap=Record<string, AuthProvider>]
 */
export class App {

  /** @satisfies {ENV<StorecraftConfig>} */
  static EnvConfig = /** @type{const} */ ({
    auth_admins_emails: 'SC_AUTH_ADMIN_EMAILS',
    auth_secret_access_token: 'SC_AUTH_SECRET_ACCESS_TOKEN',
    auth_secret_refresh_token: 'SC_AUTH_SECRET_REFRESH_TOKEN',
    auth_secret_forgot_password_token: 'SC_AUTH_SECRET_FORGOT_PASSWORD_TOKEN',
    auth_secret_confirm_email_token: 'SC_AUTH_SECRET_CONFIRM_EMAIL_TOKEN',
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
   * @type {AgentsMap} 
   */
  #agents;

  /** 
   * @type {AiProvider} 
   */
  #ai_chat_provider;

  /**
   * @type {AuthProvidersMap}
   */
  #auth_providers;

  /** 
   * @type {VectorStoreProvider} 
   */
  #vector_store;
  
  /** 
   * @description The private database driver
   * @type {Database} 
   */ 
  #db_driver;

  /** 
   * @description The private storage driver
   * @type {Storage} 
   */ 
  #storage;

  /** 
   * @description The mailer driver
   * @type {Mailer} 
   */ 
  #mailer;

  /** 
   * @description The taxes driver
   * @type {Taxes} 
   */ 
  #taxes;

  /** 
   * @description The payment gateways
   * @type {PaymentMap} 
   */ 
  #payment_gateways;

  /** 
   * @description The extensions
   * @type {ExtensionsMap} 
   */ 
  #extensions;

  /**
   * @description The app's pubsub system
   * @type {PubSub<App>}
   */
  #pubsub;

  /** 
   * @description The Storecraft App Config
   * @type {StorecraftConfig} 
   */ 
  #config;

  /** 
   * @description The REST API controller
   * @type {ReturnType<typeof create_rest_api>} 
   */ 
  #rest_controller;

  /** 
   * @description Flag for app is ready 
   * @type {boolean} 
   */ 
  #is_ready;

  /** @type {number} */
  #ms_init_start;

  /**
   * @param {StorecraftConfig} [config] config The Storecraft Application config
   */
  constructor(
    config={}
  ) {
    this.#ms_init_start = Date.now();
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
    this.#pubsub.on(
      'orders/upsert',
      async (event) => {
        const order_before = event.payload.previous;
        const order_after = event.payload.current;

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
          await this.#pubsub.dispatch(
            `orders/checkout/${order_after.status.checkout.name2}`,
            payload
          );
          await this.#pubsub.dispatch('orders/checkout/update', payload);
        }

        if(has_fulfillment_updated) {
          await this.#pubsub.dispatch(
            `orders/fulfillment/${order_after.status.fulfillment.name2}`,
            payload
          );
          await this.#pubsub.dispatch('orders/fulfillment/update', payload);
        }

        if(has_payment_updated) {
          await this.#pubsub.dispatch(
            `orders/payments/${order_after.status.payment.name2}`,
            payload
          );
          await this.#pubsub.dispatch('orders/payments/update', payload);
        }
      }
    );

  } 

  /**
   * @description After init, we inspect for missing config values and try to 
   * find them in platform environment.
   */
  #settle_config_after_init() {
    if(!this.#platform) {
      throw new Error('Storecraft:: No Platform Found !!')
    }

    const env = this.#platform.env;

    this.#config = {
      auth_secret_access_token: env?.[App.EnvConfig.auth_secret_access_token],
      auth_secret_refresh_token: env?.[App.EnvConfig.auth_secret_refresh_token],
      auth_secret_confirm_email_token: env?.[App.EnvConfig.auth_secret_confirm_email_token],
      auth_secret_forgot_password_token: env?.[App.EnvConfig.auth_secret_forgot_password_token],
      auth_admins_emails: env?.[App.EnvConfig.auth_admins_emails]?.split(',')
        .map(s => s.trim()).filter(Boolean) ?? [],
      checkout_reserve_stock_on: (/** @type {StorecraftConfig["checkout_reserve_stock_on"]} */(env?.[App.EnvConfig.checkout_reserve_stock_on])) ?? 'never',
      storage_rewrite_urls: env?.[App.EnvConfig.storage_rewrite_urls],
      general_store_name: env?.[App.EnvConfig.general_store_name],
      general_store_website: env?.[App.EnvConfig.general_store_website],
      general_store_description: env?.[App.EnvConfig.general_store_description],
      general_store_support_email: env?.[App.EnvConfig.general_store_support_email],
      general_store_logo_url: env?.[App.EnvConfig.general_store_logo_url],
      general_confirm_email_base_url: env?.[App.EnvConfig.general_confirm_email_base_url],
      general_forgot_password_confirm_base_url: env?.[
        App.EnvConfig.general_forgot_password_confirm_base_url
      ],
      dashboard_version: pkg.version,
      chat_version: pkg.version,
      ...this.#config,
    }

    assert(
      this.#config.auth_secret_access_token,
      'Storecraft:: Missing `auth_secret_access_token`'
    );
    assert(
      this.#config.auth_secret_refresh_token,
      'Storecraft:: Missing `auth_secret_refresh_token`'
    );
    assert(
      this.#config.auth_secret_confirm_email_token,
      'Storecraft:: Missing `auth_secret_confirm_email_token`'
    );
    assert(
      this.#config.auth_secret_forgot_password_token,
      'Storecraft:: Missing `auth_secret_forgot_password_token`'
    );
    assert(
      this.#config.auth_admins_emails?.length,
      'Storecraft:: Missing admin emails'
    );

  } 

  /**
   * @description Initialize the Application
   * @param {boolean} [print_banner=true] 
   * @returns {InitializedStorecraftApp<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  init(print_banner=false) {
    if(this.isready) 
      return this;
    
    try{
      // first let's settle config
      this.#settle_config_after_init();

      // settle database
      this.#db_driver?.init?.(this);

      // settle storage
      this.#storage?.init?.(this);

      // settle programmatic API
      // we do not cast the app here, because we need to pass the original
      // object to the API for some typescript tricks later.
      this.api = create_api(this);

      // settle REST-API
      this.#rest_controller = create_rest_api(
        this, this.#config
      );
  
      // settle extensions
      for(const ext_handle in this.#extensions) {
        const ext = this.#extensions?.[ext_handle];
        ext?.onInit?.(this);
      }

      // settle payment gateways
      for(const handle in this.#payment_gateways) {
        const gateway = this.#payment_gateways?.[handle];
        gateway?.onInit?.(this);
      }

      // settle ai provider
      if(this.#ai_chat_provider) {
        this.#ai_chat_provider.onInit(this);
      }

      // settle base agents
      if(this.#ai_chat_provider) {
        // @ts-ignore
        this.withAgents({
          store: new StoreAgent({
            chat_ai_provider: this.#ai_chat_provider
          })
        });

        for(const handle in this.#agents) {
          const ag = this.#agents[handle];
          ag?.init?.(this);
        }
      }
  
      // settle payment gateways
      for(const handle in this.#auth_providers) {
        const ap = this.#auth_providers[handle];
        ap?.init?.(this);
      }

      // settle vector store events
      if(this.#vector_store) {
        this.#vector_store.onInit(this);
        this.#vector_store?.embedder?.onInit(this);
        this.#pubsub.on(
          'products/upsert',
          async (evt) => {
            await save_product(
              evt.payload.current, this.#vector_store
            );
          }
        );

        this.#pubsub.on(
          'collections/upsert',
          async (evt) => {
            await save_collection(
              evt.payload.current, this.#vector_store
            );
          }
        );

        this.#pubsub.on(
          'discounts/upsert',
          async (evt) => {
            await save_discount(
              evt.payload.current, this.#vector_store
            );
          }
        );

        this.#pubsub.on(
          'shipping/upsert',
          async (evt) => {
            await save_shipping_method(
              evt.payload.current, this.#vector_store
            );
          }
        );

      }

      // settle mailer
      this.#mailer?.onInit?.(this);
  
      this.#is_ready = true;

    } catch (e) {
      this.#is_ready = false;

      // console.log(e);
      
      throw e;
    } finally {
      print_banner && this.print_banner();
    }
    return this;
  }

  /** 
   * @description Update new payment gateways and rewrite types 
   * @template {PlatformAdapter} P
   * @param {P} platform 
   * @returns {OmitAppBuild<App<
   *  P, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withPlatform(platform) {
    // @ts-ignore
    this.#platform = platform;

    // @ts-ignore
    return this;
  } 

  /** 
   * @description Update **AI** chat provider, some of the builtins
   * @template {ChatAI} P
   * @param {P} ai 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, P, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withAI(ai) {
    // @ts-ignore
    this.#ai_chat_provider = ai;

    // @ts-ignore
    return this;
  } 

  /** 
   * @description Update `agents`
   * @template {Record<string, Agent>} P
   * @param {P} agents 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, VectorStoreProvider, P & BaseAgents
   *  >>
   * }
   */
  withAgents(agents) {
    // @ts-ignore
    this.#agents = {
      ...(this.#agents ?? {}),
      ...agents
    };

    // @ts-ignore
    return this;
  } 
  
  /** 
   * @description Update new payment gateways and rewrite types 
   * @template {VectorStore} P
   * @param {P} store 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, P, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withVectorStore(store) {
    // @ts-ignore
    this.#vector_store = store;

    // @ts-ignore
    return this;
  } 

  /** 
   * @description Update new payment gateways and rewrite types 
   * @template {db_driver} D
   * @param {D} database 
   * @returns {OmitAppBuild<App<
   *  Platform, D, Storage, Mailer, PaymentMap, ExtensionsMap, Taxes, 
   *  AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withDatabase(database) {
    // @ts-ignore
    this.#db_driver = database;
    // @ts-ignore
    return this;
  }   

  /** 
   * @description Update new payment gateways and rewrite types 
   * @template {storage_driver} S
   * @param {S} storage 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, S, Mailer, PaymentMap, ExtensionsMap, Taxes, 
   *  AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withStorage(storage) {
    // @ts-ignore
    this.#storage = storage;
    // @ts-ignore
    return this;
  }   

  /** 
   * @description Update new payment gateways and rewrite types 
   * @template {mailer} M
   * @param {M} mailer 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, M, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withMailer(mailer) {
    // @ts-ignore
    this.#mailer = mailer;
    // @ts-ignore
    return this;
  }   

  /** 
   * @description Update new tax provider
   * @template {tax_provider} T
   * @param {T} taxes 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  T, AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withTaxes(taxes) {
    // @ts-ignore
    this.#taxes = taxes;
    // @ts-ignore
    return this;
  }

  /** 
   * @description Add payment gateways
   * @template {Record<string, payment_gateway>} N
   * @param {N} gateways 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, N, ExtensionsMap, Taxes, 
   *  AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  withPaymentGateways(gateways) { 
    // @ts-ignore
    this.#payment_gateways = gateways; 
    // @ts-ignore
    return this;
  }

  /** 
   * @description Add custom extensions
   * @template {Record<string, extension>} E
   * @param {E} extensions 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, E & BaseExtensions, 
   *  Taxes, AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
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
   * @description Add Auth Providers for social login
   * @template {Record<string, AuthProvider>} A
   * @param {A} providers 
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, VectorStoreProvider, AgentsMap, A
   *  >>
   * }
   */
  withAuthProviders(providers) { 
    // @ts-ignore
    this.#auth_providers = providers;
    // @ts-ignore
    return this;
  }

  /**
   * @description Subscribe to a `storecraft` event
   * @template {PubSubEvent | string} [E=PubSubEvent]
   * @param {E} event
   * @param {E extends PubSubEvent ? 
   *  PubSubSubscriber<events[E]> : 
   *  PubSubSubscriber<any>
   * } callback
   * @returns {OmitAppBuild<App<
   *  Platform, Database, Storage, Mailer, PaymentMap, ExtensionsMap, 
   *  Taxes, AiProvider, VectorStoreProvider, AgentsMap, AuthProvidersMap
   *  >>
   * }
   */
  on = (event, callback) => {
    this.#pubsub.on(event, callback);
    return this;
  }

  /**
   * @description Get the app's entire resources
   * objects. Using this is not recommended, but it can be useful.
   * using the database directly, for example, will not validate
   * types with zod and the pubsub system will not be used.
   * Use it to exploit the full power of the app.
   */
  get __show_me_everything() {
    return {
      app: this,
      auth_providers: this.#auth_providers,
      rest_controller: this.#rest_controller,
      agents: this.#agents,
      ai_chat_provider: this.#ai_chat_provider,
      vector_store: this.#vector_store,
      platform: this.#platform,
      db: this.#db_driver,
      storage: this.#storage,
      mailer: this.#mailer,
      taxes: this.#taxes,
      gateways: this.#payment_gateways,
      extensions: this.#extensions,
      pubsub: this.#pubsub,
      config: this.#config,
    }
  }

  /**
   * @description Get the app's entire resources
   * objects. Using this is not recommended, but it can be useful.
   * using the database directly, for example, will not validate
   * types with zod and the pubsub system will not be used.
   * Use it to exploit the full power of the app.
   */
  get _() {
    return this.__show_me_everything;
  }

  /**
   * @description Get `storecraft` app public information
   */
  get info() {
    return {
      core_version: pkg.version,
      dashboard_default_version: this.#config.dashboard_version,
      store_description: this.#config.general_store_description,
      store_name: this.#config.general_store_name,
      store_website: this.#config.general_store_website,
      store_support_email: this.#config.general_store_support_email,
      store_logo_url: this.#config.general_store_logo_url,
      confirm_email_base_url: this.#config.general_confirm_email_base_url,
      forgot_password_confirm_base_url: 
        this.#config.general_forgot_password_confirm_base_url,
    }
  }

  print_banner(host='', version=(pkg.version ?? 'unknown-version')) {
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
${c.reset + c.yellow}⟡ ${c.reset + c.red}Dashboard       ${c.reset + host}/dashboard    
${c.reset + c.yellow}⟡ ${c.reset + c.red}AI Chat ✨      ${c.reset + host}/chat    
${c.reset + c.yellow}⟡ ${c.reset + c.red}API Reference   ${c.reset + host}/api    
${c.reset + c.yellow}⟡ ${c.reset + c.red}Website         ${c.reset}https://storecraft.app
${c.reset + c.yellow}⟡ ${c.reset + c.red}GitHub          ${c.reset}https://github.com/store-craft/storecraft ⭐
${c.yellow}⭑ ${c.reset + c.yellow}Statistics      ${c.reset}initialized in ${(Date.now() - this.#ms_init_start)}ms
      `;

    console.log(final);
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
   * @description The app's platform environment variables
   */
  get env() {
    return this.#platform?.env;
  }

  /**
   * @description Is the app ready ?
   */
  get isready() { 
    return this.#is_ready; 
  }

  /**
   * @description Process a native platform request with 
   * context and pass it to the `rest-api` controller. 
   * This can be used in
   * 
   * - `Node.createServer(..)` as handler
   * - `Deno.serve(..)` as handler
   * - `Bun.serve(..)` as handler
   * - `GoogleFunctions` as handler
   * - `Cloudflare Workers` as handler
   * - `AWS API Gateway` as handler
   * @param {InferPlatformNativeRequest<Platform>} native_request 
   * native platform `request` object
   * @param {InferPlatformContext<Platform>} [context] 
   * (Optional )extra context object. 
   * In `node.js` for example, this is the `ServerReponse` object.
   * @returns {Promise<InferPlatformNativeResponse<Platform>>}
   */
  handler = async (native_request, context) => {
    // @ts-ignore
    context = context ?? {};
    const request = await this.#platform.encode(native_request, context);
    const response_web = await this.#rest_controller.handler(request);
    const response = await this.#platform.handleResponse(
      response_web, context
    );
    return response;
  }

}
