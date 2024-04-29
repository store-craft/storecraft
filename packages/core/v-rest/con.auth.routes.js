import { Polka } from '../v-polka/index.js'
import { 
  create_api_key, list_all_api_keys_info, 
  refresh, remove_auth_user, signin, signup 
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

  // delete existing `api key`
  polka.delete(
    '/remove/:email',
    middle_authorize_admin,
    async (req, res) => {

      await remove_auth_user(app, req.params?.email);

      res.end();
    }
  )

  // create and get a new `apikey`
  polka.post(
    '/apikeys',
    middle_authorize_admin,
    async (req, res) => {
      const result = await create_api_key(app);

      res.sendJson(result);
    }
  )


  // get all existing `apikeys`
  polka.get(
    '/apikeys',
    middle_authorize_admin,
    async (req, res) => {
      const result = await list_all_api_keys_info(app);

      res.sendJson(result);
    }
  )


  return polka;
}

