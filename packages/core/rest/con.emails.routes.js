/** 
 * @import { ApiPolka } from './types.public.js' 
 */
import { Polka } from './polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { App } from '../index.js'

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  const middle_authorize_admin = authorize_admin(app)
  polka.use(middle_authorize_admin);

  polka.post(
    '/send',
    async (req, res) => {
      const final = await app.api.email.sendMail(
        req.parsedBody
      );
      res.sendJson(final);
    }
  );

  polka.post(
    '/send-with-template',
    async (req, res) => {
      const final = await app.api.email.sendMailWithTemplate(
        req.parsedBody
      );
      res.sendJson(final);
    }
  );

  return polka;
}

