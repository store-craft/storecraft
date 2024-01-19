import { Polka } from '../../v-polka/index.js'
import * as phash from '../../utils/crypto-pbkdf2.js'
import * as jwt from '../../utils/jwt.js'
import { ID } from '../utils.js'
import { z } from 'zod'
import { json } from '../../v-middlewares/body-parse.js'
import { zod_validate_body } from '../../v-middlewares/zod-validate.js'
import { apiAuthLoginTypeSchema, apiAuthRefreshTypeSchema, apiAuthSignupTypeSchema } from './types.autogen.zod.api.js'

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../../types.public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create = (app) => {

  /** @type {import('../../types.public.js').ApiPolka} */
  const polka = new Polka();

  // signup
  polka.post(
    '/signup',
    json(),
    zod_validate_body(apiAuthSignupTypeSchema),
    async (req, res) => {
      /** @type {z.infer<typeof apiAuthSignupTypeSchema>} */
      const { email, password } = req.parsedBody;
  
      // Check if the user already exists
      const existingUser = await app.db.auth_users.getByEmail(email)

      if (existingUser) {
        throw new Error('auth-already-signed-up', { cause: 400 })
      }
  
      // Hash the password using pbkdf2
      const hashedPassword = await phash.hash(
        password, parseInt(app.platform.env.AUTH_PBKDF2_ITERATIONS) ?? 1000
      );
  
      // Create a new user in the database
      const id = ID('au');
      const roles = app.db.admins_emails.includes(email) ? ['admin'] : ['user']

      await app.db.auth_users.upsert(
        {
          id: id,
          email, password: hashedPassword,
          confirmed_mail: false,
          // @ts-ignore
          roles
        }
      )
  
      /** @type {Partial<import("../../utils/jwt.js").JWTClaims>} */
      const claims = {
        sub: id, 
        // @ts-ignore
        roles
      }
  
      const access_token = await jwt.create(
        app.platform.env.AUTH_SECRET_ACCESS_TOKEN, 
        claims, jwt.JWT_TIMES.HOUR
      );
  
      const refresh_token = await jwt.create(
        app.platform.env.AUTH_SECRET_REFRESH_TOKEN, 
        {...claims, aud: '/refresh'}, jwt.JWT_TIMES.DAY * 7
      );
  
      res.sendJson(
        {
          token_type: 'Bearer',
          user_id: id,
          access_token, refresh_token
        }
      );
  
    }
  )
  
  // login
  polka.post(
    '/login',
    json(),
    zod_validate_body(apiAuthLoginTypeSchema),
    async (req, res) => {

      /** @type {z.infer<typeof apiAuthLoginTypeSchema>} */
      const { email, password } = req.parsedBody;

      // Check if the user already exists
      const existingUser = await app.db.auth_users.getByEmail(email)

      if (!existingUser) {
        throw new Error('auth-error', { cause: 401 })
      }
  
      // verify the password
      const verified = await phash.verify(existingUser.password, password);
      
      if(!verified)
        throw new Error('auth-error', { cause: 401 })
  
      /** @type {Partial<import("../../utils/jwt.js").JWTClaims>} */
      const claims = {
        sub: existingUser.id,
        roles: existingUser.roles
      }
  
      const access_token = await jwt.create(
        app.platform.env.AUTH_SECRET_ACCESS_TOKEN, 
        claims, jwt.JWT_TIMES.HOUR
      );
  
      const refresh_token = await jwt.create(
        app.platform.env.AUTH_SECRET_REFRESH_TOKEN, 
        {...claims, aud: '/refresh'}, jwt.JWT_TIMES.DAY * 7
      );
  
      res.sendJson(
        {
          token_type: 'Bearer',
          user_id: existingUser.id,
          access_token, refresh_token
        }
      );
      
    }
  )
  
  // refresh
  polka.post(
    '/refresh',
    json(),
    zod_validate_body(apiAuthRefreshTypeSchema),
    async (req, res) => {

      /** @type {z.infer<typeof apiAuthRefreshTypeSchema>} */
      const { refresh_token } = req.parsedBody;
  
      if(!refresh_token)
        throw new Error('auth-error', { cause: 400 })
  
      // Check if the user already exists
      let { verified, claims } = await jwt.verify(
        app.platform.env.AUTH_SECRET_REFRESH_TOKEN, 
        refresh_token, true
      );
  
      // confirm it is indeed a refresh token
      verified = verified && claims?.aud==='/refresh';
  
      if (!verified) {
        throw new Error('auth-error', { cause: 401 })
      }
   
      const access_token = await jwt.create(
        app.platform.env.AUTH_SECRET_ACCESS_TOKEN, 
        { 
          // @ts-ignore
          sub: claims.sub, roles: claims.roles 
        }, jwt.JWT_TIMES.HOUR
      );
  
      res.sendJson(
        {
          token_type: 'Bearer',
          user_id: access_token.claims.sub,
          access_token, 
          refresh_token: {
            token: refresh_token,
            claims: claims
          }
        }
      );
    }
  )
  
  return polka;
}

