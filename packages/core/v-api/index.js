import { json } from "../v-polka/body-parse.js";
import { Polka } from "../v-polka/index.js";
import { create_routes as create_auth_route } from "./con.auth.routes.js";
import { create_routes as create_tags_route } from "./con.tags.routes.js";
import { create_routes as create_col_route } from "./con.collections.routes.js";
import { create_routes as create_cus_route } from "./con.customers.routes.js";

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
  const coll = create_col_route(app);
  const cus = create_cus_route(app);

  polka.use(json());

  polka.use(
    '/api/auth',
    auth
  );

  polka.use(
    '/api/tags',
    tags
  );

  polka.use(
    '/api/collections',
    coll
  );

  polka.use(
    '/api/customers',
    cus
  );

  return polka;
}




