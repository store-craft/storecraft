import { json } from "../v-polka/body-parse.js";
import { Polka } from "../v-polka/index.js";
import { create as create_auth_route } from "./con.auth.js";
import { create as create_tags_route } from "./con.tags.js";

/**
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

  polka.use(json());

  polka.use(
    '/api/auth',
    auth
  );

  polka.use(
    '/api/tags',
    tags
  );

  return polka;
}




