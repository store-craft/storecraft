/** @import { ApiPolka } from './types.public.js' */
import { App } from '../index.js';
import { Polka } from '../polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { 
  get_extension, invoke_extension_action, list_extensions 
} from '../extensions/con.extensions.logic.js';


/**
 * 
 * @param {App} app
 * 
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  // get extension
  polka.get(
    '/:extension_handle',
    authorize_admin(app),
    async (req, res) => {
      const { extension_handle } = req.params;
      const r = get_extension(
        app, extension_handle
      );
      res.sendJson(r);
    }
  );

  
  // list extensions
  polka.get(
    '/',
    authorize_admin(app),
    async (req, res) => {
      const r = list_extensions(
        app
      );
      res.sendJson(r);
    }
  );


  // invoke action of extension
  polka.post(
    '/:extension_handle/:action_handle',
    async (req, res) => {
      const { extension_handle, action_handle } = req.params;
      const r = await invoke_extension_action(
        app, extension_handle, action_handle, req.parsedBody
      );
      
      res.sendJson(r);
    }
  );

  return polka;
}

