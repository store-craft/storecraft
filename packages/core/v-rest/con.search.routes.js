import { Polka } from '../v-polka/index.js'
import { parse_query } from '../v-api/utils.query.js'

/**
 * @typedef {import('../v-api/types.api.js').TagType} ItemType
 */

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

  /** @type {import('../types.public.js').ApiPolka} */
  const polka = new Polka();

  // search
  polka.get(
    '/',
    async (req, res) => {
      let q = parse_query(req.query);
      const items = await app.api.search.quicksearch(q);
      res.sendJson(items);
    }
  );

  return polka;
}

