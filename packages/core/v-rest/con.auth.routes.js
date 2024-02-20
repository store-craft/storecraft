import { Polka } from '../v-polka/index.js'
import { refresh, signin, signup } from '../v-api/con.auth.logic.js'

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create_routes = (app) => {

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
  
  return polka;
}

