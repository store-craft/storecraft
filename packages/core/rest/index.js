/** 
 * @import { CORSOptions } from './polka/cors.js' 
 */
import { App } from '../index.js';
import { json } from "./polka/body-parse.js";
import { cors } from "./polka/cors.js";
import { Polka } from "./polka/index.js";
import { create_routes as create_auth_route } from "./con.auth.routes.js";
import { create_routes as create_tags_route } from "./con.tags.routes.js";
import { create_routes as create_templates_route } from "./con.templates.routes.js";
import { create_routes as create_col_route } from "./con.collections.routes.js";
import { create_routes as create_cus_route } from "./con.customers.routes.js";
import { create_routes as create_images_route } from "./con.images.routes.js";
import { create_routes as create_posts_route } from "./con.posts.routes.js";
import { create_routes as create_storefronts_route } from "./con.storefronts.routes.js";
import { create_routes as create_discounts_route } from "./con.discounts.routes.js";
import { create_routes as create_orders_route } from "./con.orders.routes.js";
import { create_routes as create_notifications_route } from "./con.notifications.routes.js";
import { create_routes as create_shipping_route } from "./con.shipping.routes.js";
import { create_routes as create_products_route } from "./con.products.routes.js";
import { create_routes as create_storage_route } from "./con.storage.routes.js";
import { create_routes as create_checkout_route } from "./con.checkout.routes.js";
import { create_routes as create_payment_gateways_route } from "./con.payment-gateways.routes.js";
import { create_routes as create_extensions_route } from "./con.extensions.routes.js";
import { create_routes as create_statistics_route } from "./con.statistics.routes.js";
import { create_routes as create_others_route } from "./con.others.routes.js";
import { create_routes as create_dashboard_route } from "./con.dashboard.routes.js";
import { create_routes as create_chat_route } from "./con.chat.routes.js";
import { create_routes as create_search_route } from "./con.search.routes.js";
import { create_routes as create_ai_route } from "./con.ai.routes.js";
import { create_routes as create_similarity_search_route } from "./con.similarity-search.routes.js";
import { create_routes as create_emails_route } from "./con.emails.routes.js";
import { PolkaResponseCreator } from './polka/response-creator.js';
import { assert } from '../api/utils.func.js';


/**
 * @typedef {object} RestApiConfig
 * @prop {CORSOptions} [cors]
 */


/**
 * @description Create the entire virtual API with lazy 
 * loading which is great for serverless
 * @param {App} app
 * @param {RestApiConfig} config
 */
export const create_rest_api = (app, config) => {
  // This is the main / root router
  const polka = new Polka();

  polka.use(cors(config?.cors));
  polka.use(json());

  const lazy_creator = new class {
    #factory = {}
    #routes = {}

    constructor() {
      this.#factory['/api/auth'] = create_auth_route;
      this.#factory['/api/tags'] = create_tags_route;
      this.#factory['/api/templates'] = create_templates_route;
      this.#factory['/api/collections'] = create_col_route;
      this.#factory['/api/customers'] = create_cus_route;
      this.#factory['/api/images'] = create_images_route;
      this.#factory['/api/posts'] = create_posts_route;
      this.#factory['/api/storefronts'] = create_storefronts_route;
      this.#factory['/api/discounts'] = create_discounts_route;
      this.#factory['/api/orders'] = create_orders_route;
      this.#factory['/api/notifications'] = create_notifications_route;
      this.#factory['/api/shipping'] = create_shipping_route;
      this.#factory['/api/products'] = create_products_route;
      this.#factory['/api/storage'] = create_storage_route;
      this.#factory['/api/checkout'] = create_checkout_route;
      this.#factory['/api/payments'] = create_payment_gateways_route;
      // this.#factory['/api/reference'] = create_others_route;
      this.#factory['/api/statistics'] = create_statistics_route;
      this.#factory['/api/extensions'] = create_extensions_route;
      this.#factory['/api/search'] = create_search_route;
      this.#factory['/api/ai'] = create_ai_route;
      this.#factory['/api/similarity-search'] = create_similarity_search_route;
      this.#factory['/api/emails'] = create_emails_route;
      this.#factory['/api/dashboard'] = create_dashboard_route;
      this.#factory['/api'] = create_others_route;
      this.#factory['/dashboard'] = create_dashboard_route;
      this.#factory['/chat'] = create_chat_route;
    }

    /** 
     * @description This method will lazy load and register the `polka`
     * endpoints. This is done as optimization and avoiding running
     * all the code that registers the endpoints at once. This is desirable
     * as this code might run on `serverless` platforms.
     * @param {string} path 
     */
    load_route_lazily(path) {

      const match = Object
      .keys(this.#factory)
      .find(
        (k) => path.startsWith(k)
      );

      { // because we lazy load routes, we cannot control the order
        // of the routes. So we need to remove the `/api` route
        // because it will steal the request from the other routes
        // that were registered after.
        if(this.#routes['/api']) {
          polka.remove_route_by_original_registered_route('/api');
          this.#routes['/api'] = undefined;
        }
      }

      // console.log(Object.keys(this.#factory));
      // console.log({path, match, routes: this.#routes});
      
      if(!match)
        return undefined;

      if(!this.#routes[match]) {
        const route_creator = this.#factory[match];

        if(route_creator) {
          const new_route = route_creator(app);

          polka.use(match, new_route);

          this.#routes[match] = new_route;

          return new_route;
        }
      } 
    }
  }

  return {
    root: polka,
    logger: Polka.logger,
    /**
     * The `rest-api` controller of `storecraft`. 
     * Works with standard Web `Request` and `Response`
     * @param {Partial<Request>} request 
     */
    handler: async (request) => {
      const start_millis = Date.now();
      const pathname = new URL(request.url).pathname;

      lazy_creator.load_route_lazily(pathname);

      const response_creator = await polka.handler(
        request, new PolkaResponseCreator()
      );

      assert(
        response_creator,
        'No response creator found for path: ' + pathname + 
        '. You probably didn\' stop the call chain on an error',
      )

      const response = new Response(
        response_creator.body,
        {
          status: response_creator.status,
          statusText: response_creator.statusText,
          headers: response_creator.headers
        }
      );

      log_request(request, response, start_millis);

      return response;
    }
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

const error_format = (text='') => {
  return `🚫 \x1b[1;41;37m${text}\x1b[0m`;
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

/**
 * log request
 * @param {Partial<Request>} request 
 * @param {Partial<Response>} response 
 * @param {number} start_millis 
 */
const log_request = (request, response, start_millis) => {
  const delta = Date.now() - start_millis;
  const url = new URL(decodeURIComponent(request.url));
  const method = response.ok ? 
    method_to_color[request.method] : 
    error_format(request.method);

  const line = method + 
    ' \x1b[33m' + 
    url.pathname.slice(0, 250) + 
    '\x1b[0m' + 
    ` (${delta}ms)`;
    
  console.log(line);

  if(url.search)
    console.log(c.cyan, url.search, c.reset);
}




