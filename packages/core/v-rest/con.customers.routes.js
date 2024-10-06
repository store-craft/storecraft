/** 
 * @import { ApiRequest, ApiResponse, ApiPolka } from './types.public.js' 
 * @import { Role } from "../v-api/types.api.js"; 
 */
import { Polka } from '../v-polka/index.js'
import { assert } from '../v-api/utils.func.js'
import { parse_auth_user, roles_guard } from './con.auth.middle.js'
import { parse_query } from '../v-api/utils.query.js'
import { owner_or_admin_guard } from './con.customers.middle.js'
import { App } from '../index.js'

/**
 * @typedef {import('../v-api/types.api.d.ts').CustomerType} ItemType
 */

/**
 * 
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = roles_guard(['admin'])

  polka.use(parse_auth_user(app));

  // save
  polka.post(
    '/',
    owner_or_admin_guard,
    async (req, res) => {
      const final = await app.api.customers.upsert(req.parsedBody);
      res.sendJson(final);
    }
  )

  // get item
  polka.get(
    '/:email_or_id',
    owner_or_admin_guard,
    async (req, res) => {
      const { email_or_id } = req?.params;
      const item = await app.api.customers.get(email_or_id);

      assert(item, 'not-found', 404);

      res.sendJson(item);
    }
  );

  // delete item
  polka.delete(
    '/:email_or_id',
    middle_authorize_admin,
    async (req, res) => {
      const { email_or_id } = req?.params;
      const removed = email_or_id && await app.api.customers.remove(email_or_id);

      res.setStatus(removed ? 200 : 404).end();
    }
  );

  // list
  polka.get(
    '/',
    middle_authorize_admin,
    async (req, res) => {
      const q = parse_query(req.query);
      const items = await app.api.customers.list(q);

      res.sendJson(items);
    }
  );

  // list orders of customer
  polka.get(
    '/:email_or_id/orders',
    owner_or_admin_guard,
    async (req, res) => {
      const { email_or_id } = req.params;
      const q = parse_query(req.query);
      const items = await app.api.customers.list_customer_orders(email_or_id, q);
      
      res.sendJson(items);
    }
  );

  return polka;
}

