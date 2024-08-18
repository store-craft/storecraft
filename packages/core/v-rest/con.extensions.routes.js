import { Polka } from '../v-polka/index.js'
import { authorize_admin } from './con.auth.middle.js'
import { 
  get_extension, invoke_extension_action, list_extensions 
} from '../v-extensions/con.extensions.logic.js';


/**
 * 
 * @param {import("../types.public.d.ts").App} app
 * 
 */
export const create_routes = (app) => {

  /** @type {import('./types.public.d.ts').ApiPolka} */
  const polka = new Polka();

  // admin only
  polka.use(authorize_admin(app));

  // get extension
  polka.get(
    '/:extension_handle',
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

