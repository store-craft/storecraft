import { Polka } from '../../v-polka/index.js'
import * as phash from '../../utils/crypto-pbkdf2.js'
import * as jwt from '../../utils/jwt.js'
import { ID } from '../utils.js'
import { z } from 'zod'
import { json } from '../../v-middlewares/body-parse.js'
import { zod_validate_body } from '../../v-middlewares/zod-validate.js'
import { apiAuthLoginTypeSchema, apiAuthRefreshTypeSchema, apiAuthSignupTypeSchema, tagTypeSchema } from './types.autogen.zod.api.js'
import { authorize } from './middle.auth.js'

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create = (app) => {

  /** @type {import('../../types.public.js').ApiPolka} */
  const polka = new Polka();

  const middle_authorize = authorize(app, ['admin'])

  polka.use(json());

  // signup
  polka.post(
    '/',
    middle_authorize,
    zod_validate_body(tagTypeSchema),
    async (req, res) => {

      /** @type {z.infer<typeof apiAuthSignupTypeSchema>} */
      const { email, password } = req.parsedBody;
  
      // Check if the user already exists
      const existingUser = await app.db.auth_users.getByEmail(email)

      res.sendJson(
        {
          token_type: 'Bearer',
        }
      );
  
    }
  )
  
  return polka;
}

