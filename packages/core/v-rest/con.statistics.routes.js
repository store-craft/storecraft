import { Polka } from '../v-polka/index.js'
import { authorize_by_roles } from './con.auth.middle.js'
import { compute_statistics } from '../v-api/con.statistics.logic.js';

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * 
 * @param {import("../types.public.js").App<
 *  PlatformNativeRequest, PlatformContext>
 * } app
 */
export const create_routes = (app) => {

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_by_roles(app, ['admin'])

  // `Compute Statistics`
  polka.get(
    '/orders',
    middle_authorize_admin,
    async (req, res) => {

      const from_day = req?.query.get('fromDay');
      const to_day = req?.query.get('toDay');

      const stats = await compute_statistics(
        app, from_day, to_day
      );

      res.sendJson(stats);
    }
  );

  return polka;
}

