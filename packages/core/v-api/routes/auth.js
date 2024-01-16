import { Polka } from '../../v-polka/index.js'
import * as phash from '../../utils/crypto-pbkdf2.js'
import * as jwt from '../../utils/jwt.js'

const AUTH_USERS = {
}

/**
 * 
 * @template PlatformNativeRequest
 * @template PlatformContext
 * @param {import("../../public.js").App<PlatformNativeRequest, PlatformContext>} app
 */
export const create = (app) => {

  const polka = new Polka();

  // signup
  polka.post(
    '/signup',
    async (req, res) => {
      const { email, password } = await req.json();
  
      // Check if the user already exists
      const existingUser = AUTH_USERS[email];
      if (existingUser) {
        throw new Error('auth-already-signed-up', { cause: 400 })
      }
  
      // Hash the password using pbkdf2
      const hashedPassword = await phash.hash(
        password, parseInt(app.platform.env.AUTH_PBKDF2_ITERATIONS) ?? 1000
      );
  
      // Create a new user in the database
      AUTH_USERS[email] = {
        email, password: hashedPassword 
      }
  
      /** @type {Partial<import("../../utils/jwt.js").JWTClaims>} */
      const claims = {
        sub: email
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
          user_id: '?',
          access_token, refresh_token
        }
      );
  
    }
  )
  
  // login
  polka.post(
    '/login',
    async (req, res) => {
      const { email, password } = await req.json();
      // Check if the user already exists
      const existingUser = AUTH_USERS[email];
      if (!existingUser) {
        throw new Error('auth-error', { cause: 401 })
      }
  
      // verify the password
      const verified = await phash.verify(existingUser.password, password);
      
      if(!verified)
        throw new Error('auth-error', { cause: 401 })
  
      /** @type {Partial<import("../utils/jwt.js").JWTClaims>} */
      const claims = {
        sub: email
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
          user_id: '?',
          access_token, refresh_token
        }
      );
      
    }
  )
  
  // refresh
  polka.post(
    '/refresh',
    async (req, res) => {
      const { refresh_token } = await req.json();
  
      if(!refresh_token)
        throw new Error('auth-error', { cause:400 })
  
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
        {...claims}, jwt.JWT_TIMES.HOUR
      );
  
      res.sendJson(
        {
          token_type: 'Bearer',
          user_id: '?',
          access_token, 
          refresh_token: {
            token: refresh_token,
            claims: jwt.extractJWTClaims(refresh_token)
          }
        }
      );
      
    }
  )
  
  return polka;
}

