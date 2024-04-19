import { Polka } from '../v-polka/index.js'
import { 
  create_api_key, get_existing_api_key_info, refresh, remove_auth_user, signin, signup 
} from '../v-api/con.auth.logic.js'
import { authorize_admin } from './con.auth.middle.js';

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * @param {import("../types.public.js").App<
 *  PlatformNativeRequest, PlatformContext
 * >} app
 */
export const create_routes = (app) => {
  const middle_authorize_admin = authorize_admin(app);

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  // signup
  polka.post(
    '/signup',
    async (req, res) => {
      const result = await signup(app, req.parsedBody);
      res.sendJson(result);
    }
  )
  
  // login
  polka.post(
    '/signin',
    async (req, res) => {
      const result = await signin(app, req.parsedBody);
      res.sendJson(result);
    }
  )
   
  // refresh 
  polka.post(
    '/refresh',
    async (req, res) => {
      const result = await refresh(app, req.parsedBody);
      res.sendJson(result);
    }
  )

  // create and get a new `api key`
  polka.post(
    '/apikey',
    middle_authorize_admin,
    async (req, res) => {
      const result = await create_api_key(app);

      res.sendJson(result);
    }
  )


  // get existing `api key`
  polka.get(
    '/apikey',
    middle_authorize_admin,
    async (req, res) => {
      const result = await get_existing_api_key_info(app);

      res.sendJson(result);
    }
  )

  // delete existing `api key`
  polka.delete(
    '/apikey',
    middle_authorize_admin,
    async (req, res) => {

      await remove_auth_user(app, req.params?.email);

      res.end();
    }
  )

  return polka;
}

