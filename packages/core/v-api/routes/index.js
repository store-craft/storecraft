import { Polka } from "../../v-polka/index.js";
import { create as create_auth_route } from "./auth.js";

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../../public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create_api = (app) => {
  const polka = new Polka();
  const auth = create_auth_route(app);

  polka.use(
    '/api/auth',
    auth
  )
  
  return polka;
}




