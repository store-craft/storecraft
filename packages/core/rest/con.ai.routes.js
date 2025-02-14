/** @import { ApiPolka } from './types.public.js' */
import { Polka } from '../polka/index.js'
import { assert } from '../api/utils.func.js'
import { App } from '../index.js';

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  polka.post(
    '/',
    async (req, res) => {

      const r = await app.ai.run(
        req.parsedBody
      )

      res.sendJson(r);
    }
  );

  return polka;
}

