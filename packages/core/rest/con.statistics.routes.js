/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { parse_query } from '../api/utils.query.js';


/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app);

  // `Compute Statistics of orders`
  polka.get(
    '/orders',
    middle_authorize_admin,
    async (req, res) => {
      const from_day = req?.query.get('fromDay');
      const to_day = req?.query.get('toDay');
      const stats = await app.api.statistics.compute_statistics(
        from_day, to_day
      );
      res.sendJson(stats);
    }
  );

  polka.get(
    '/count/:table',
    middle_authorize_admin,
    async (req, res) => {
      let q = parse_query(req.query);
      const table = req?.params?.table;
      const count = await app.api.statistics.compute_count_of_query(
        table, q
      );
      res.sendJson(count);
    }
  );

  return polka;
}

