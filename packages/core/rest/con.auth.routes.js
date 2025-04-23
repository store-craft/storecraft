/** 
 * @import { ApiPolka } from './types.public.js' 
 * @import { AuthUserType } from '../api/types.public.js' 
 * @import { ApiQuery } from '../api/types.api.query.js' 
 */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js';
import { parse_query } from '../api/query.js';
import { create_routes as idp_routes } from './con.auth.identity-providers.routes.js';

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {
  const middle_authorize_admin = authorize_admin(app);

  /** @type {ApiPolka} */
  const polka = new Polka();

  polka.use(
    '/identity-providers',
    idp_routes(app)
  );

  // signup 
  polka.post(
    '/signup',
    async (req, res) => {
      const result = await app.api.auth.signup(req.parsedBody);
      res.sendJson(result);
    }
  );
  
  // signin
  polka.post(
    '/signin',
    async (req, res) => {
      const result = await app.api.auth.signin(req.parsedBody);
      res.sendJson(result);
    }
  );

  // refresh 
  polka.post(
    '/refresh',
    async (req, res) => {
      const result = await app.api.auth.refresh(req.parsedBody);
      res.sendJson(result);
    }
  );

  // change password
  polka.post(
    '/change-password',
    async (req, res) => {
      const result = await app.api.auth.change_password(req.parsedBody);
      res.sendJson(result);
    }
  );

  // confirm email with token 
  polka.get(
    '/confirm-email',
    async (req, res) => {
      const token = req.query.get('token');
      const result = await app.api.auth.confirm_email(token);
      res.end();
    }
  );

  // initiate a `forgot-password` flow, which internally dispatches 
  // an event with a token that should be sent to the user.
  polka.get(
    '/forgot-password-request',
    async (req, res) => {
      const email = req.query.get('email');
      await app.api.auth.forgot_password_request(email);
      res.end();
    }
  );

  // Verifies, that a `forgot-password` request is legal, 
  // changes the password to a random one, and returns it and 
  // dispatches `auth/forgot-password-token-confirmed` event.
  polka.get(
    '/forgot-password-request-confirm',
    async (req, res) => {
      const token = req.query.get('token');
      const result = await app.api.auth.forgot_password_request_confirm(token);
      res.sendJson(result);
    }
  );


  // delete existing `api key`
  polka.delete(
    '/users/:email',
    middle_authorize_admin,
    async (req, res) => {
      const success = await app.api.auth.remove_auth_user(
        req.params?.email
      );
      res.sendJson(success);
    }
  );

  polka.get(
    '/users/count_query',
    middle_authorize_admin,
    async (req, res) => {
      let q = (/** @type {ApiQuery<AuthUserType>} */ (
        parse_query(req.query))
      );
      const count = await app.api.auth.count(q);
      res.sendJson(count);
    }
  );

  polka.get(
    '/users/:email',
    middle_authorize_admin,
    async (req, res) => {
      const item = await app.api.auth.get_auth_user(req.params?.email);
      res.sendJson(item);
    }
  );

  polka.get(
    '/users',
    middle_authorize_admin,
    async (req, res) => {
      let q = (/** @type {ApiQuery<AuthUserType>} */ (
        parse_query(req.query))
      );
      const items = await app.api.auth.list_auth_users(q);
      res.sendJson(items);
    }
  );

  // create and get a new `apikey`
  polka.post(
    '/apikeys',
    middle_authorize_admin,
    async (req, res) => {
      const result = await app.api.auth.create_api_key();
      res.sendJson(result);
    }
  );


  // get all existing `apikeys`
  polka.get(
    '/apikeys',
    middle_authorize_admin,
    async (req, res) => {
      const result = await app.api.auth.list_all_api_keys_info();
      res.sendJson(result);
    }
  );

  return polka;
}

