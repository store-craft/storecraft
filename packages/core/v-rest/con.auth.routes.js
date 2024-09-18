/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from '../v-polka/index.js'
import { authorize_admin } from './con.auth.middle.js';
import { parse_query } from '../v-api/utils.query.js';

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {
  const middle_authorize_admin = authorize_admin(app);

  /** @type {ApiPolka} */
  const polka = new Polka();

  // signup 
  polka.post(
    '/signup',
    async (req, res) => {
      const result = await app.api.auth.signup(req.parsedBody);
      res.sendJson(result);
    }
  )
  
  // signin
  polka.post(
    '/signin',
    async (req, res) => {
      const result = await app.api.auth.signin(req.parsedBody);
      res.sendJson(result);
    }
  )

  // change password
  polka.post(
    '/change-password',
    async (req, res) => {
      const result = await app.api.auth.change_password(req.parsedBody);
      res.sendJson(result);
    }
  )
  
  // refresh 
  polka.post(
    '/refresh',
    async (req, res) => {
      const result = await app.api.auth.refresh(req.parsedBody);
      res.sendJson(result);
    }
  )

  // delete existing `api key`
  polka.delete(
    '/users/:email',
    middle_authorize_admin,
    async (req, res) => {

      await app.api.auth.remove_auth_user(req.params?.email);

      res.end();
    }
  )

  polka.get(
    '/users/:email',
    middle_authorize_admin,
    async (req, res) => {
      const item = await app.api.auth.get_auth_user(req.params?.email);

      res.sendJson(item);
    }
  )

  // delete existing `auth user`
  polka.get(
    '/users',
    middle_authorize_admin,
    async (req, res) => {
      let q = parse_query(req.query);

      const items = await app.api.auth.list_auth_users(q);

      res.sendJson(items);
    }
  )

  // create and get a new `apikey`
  polka.post(
    '/apikeys',
    middle_authorize_admin,
    async (req, res) => {
      const result = await app.api.auth.create_api_key();

      res.sendJson(result);
    }
  )


  // get all existing `apikeys`
  polka.get(
    '/apikeys',
    middle_authorize_admin,
    async (req, res) => {
      const result = await app.api.auth.list_all_api_keys_info();

      res.sendJson(result);
    }
  )


  return polka;
}

