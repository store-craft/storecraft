import { json } from "../v-polka/body-parse.js";
import { Polka } from "../v-polka/index.js";
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
import { create_routes as create_search_route } from "./con.search.routes.js";
import { cors } from "../v-polka/cors.js";


/**
 * @typedef {import("../types.public.js").ApiRequest} ApiRequest
 * @typedef {import("../types.public.js").ApiResponse} ApiResponse
 */

/**
 * Create the entire virtual API with lazy loading which is great for serverless
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext, any, any, any, any, any>} app
 */
export const create_rest_api = (app) => {
  // This is the main / root router
  const polka = new Polka();

  polka.use(cors());
  polka.use(json());

  const lazy_creator = new class {
    #factory = {}
    #controllers = {}

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
      this.#factory['/api/info'] = create_others_route;
      this.#factory['/api/statistics'] = create_statistics_route;
      this.#factory['/api/extensions'] = create_extensions_route;
      this.#factory['/api/search'] = create_search_route;
    }

    /** 
     * 
     * This method will lazy load and register the `polka`
     * endpoints. This is done as optimization and avoiding running
     * all the code that registers the endpoints at once. This is desirable
     * as this code might run on `serverless` platforms.
     * 
     * @param {string} path 
     */
    load_route_lazily(path) {

      const key = path?.split('/').slice(0, 3).join('/');

      console.log(
        path.split('/').slice(0,3)
      );

      const con = this.#controllers[key];

      if(!con) {
        const f = this.#factory[key];

        if(f) {
          const con_new = f(app);
          polka.use(key, con_new);
          this.#controllers[key] = con_new;
          return con_new;
        }
      } 

      return undefined;
    }

  }

  return {
    root: polka,
    /**
     * 
     * @param {ApiRequest} req 
     * @param {ApiResponse} res 
     */
    handler: async (req, res) => {

      const pathname = new URL(req.url).pathname

      lazy_creator.load_route_lazily(pathname);

      return polka.handler(req, res);
    }
  }
}




