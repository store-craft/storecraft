import { json } from "../v-polka/body-parse.js";
import { Polka } from "../v-polka/index.js";
import { create_routes as create_auth_route } from "./con.auth.routes.js";
import { create_routes as create_tags_route } from "./con.tags.routes.js";
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

/**
 * Create the entire virtual API
 * TODO: maybe experiment with lazy loading ?
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 * @return {Polka<import("../types.public.js").ApiRequest, import("../types.public.js").ApiResponse>}
 */
export const create_api = (app) => {
  const polka = new Polka();
  const auth = create_auth_route(app);
  const tags = create_tags_route(app);
  const collections = create_col_route(app);
  const customers = create_cus_route(app);
  const images = create_images_route(app);
  const posts = create_posts_route(app);
  const storefronts = create_storefronts_route(app);
  const discounts = create_discounts_route(app);
  const orders = create_orders_route(app);
  const notifications = create_notifications_route(app);
  const shipping = create_shipping_route(app);
  const products = create_products_route(app);
  const storage = create_storage_route(app);
  const checkout = create_checkout_route(app);
  const gateways = create_payment_gateways_route(app);

  polka.use(json());
  polka.use('/api/auth', auth);
  polka.use('/api/tags', tags);
  polka.use('/api/collections', collections);
  polka.use('/api/customers', customers);
  polka.use('/api/images', images);
  polka.use('/api/posts', posts);
  polka.use('/api/storefronts', storefronts);
  polka.use('/api/discounts', discounts);
  polka.use('/api/orders', orders);
  polka.use('/api/notifications', notifications);
  polka.use('/api/shipping', shipping);
  polka.use('/api/products', products);
  polka.use('/api/storage', storage);
  polka.use('/api/checkout', checkout);
  polka.use('/api/gateways', gateways);

  return polka;
}




