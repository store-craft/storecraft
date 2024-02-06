import * as phash from '../v-utils/crypto-pbkdf2.js'
import * as jwt from '../v-utils/jwt.js'
import { ID, apply_dates, assert } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { 
  apiAuthRefreshTypeSchema, 
  apiAuthSigninTypeSchema, 
  apiAuthSignupTypeSchema } from './types.autogen.zod.api.js'
import { App } from '../index.js'


/**
 * 
 * @param {App} app 
 * @param {import('../types.api.js').ApiAuthSignupType} body 
 */  
export const signup = async (app, body) => {

  assert_zod(apiAuthSignupTypeSchema, body);
  
  const { email, password } = body;
  
  // Check if the user already exists
  const existingUser = await app.db.auth_users.getByEmail(email)

  assert(!existingUser, 'auth/already-signed-up', 400)

  // Hash the password using pbkdf2
  const hashedPassword = await phash.hash(
    password, parseInt(app.platform.env.AUTH_PBKDF2_ITERATIONS) ?? 1000
  );

  // Create a new user in the database
  const id = ID('au');
  const roles = app.db.admins_emails.includes(email) ? ['admin'] : ['user'];

  await app.db.auth_users.upsert(
    apply_dates(
      {
        id: id,
        email, password: hashedPassword,
        confirmed_mail: false,
        roles
      }
    )
  );

  /** @type {Partial<import("../v-utils/jwt.js").JWTClaims>} */
  const claims = {
    sub: id, 
    // @ts-ignore
    roles
  };

  const access_token = await jwt.create(
    app.platform.env.AUTH_SECRET_ACCESS_TOKEN, 
    claims, jwt.JWT_TIMES.HOUR
  );

  const refresh_token = await jwt.create(
    app.platform.env.AUTH_SECRET_REFRESH_TOKEN, 
    {...claims, aud: '/refresh'}, jwt.JWT_TIMES.DAY * 7
  );

  return {
      token_type: 'Bearer',
      user_id: id,
      access_token, refresh_token
  }
}

/**
 * 
 * @param {App} app 
 * @param {import('../types.api.js').ApiAuthSigninType} body 
 */  
export const signin = async (app, body) => {
  assert_zod(apiAuthSigninTypeSchema, body);

  const { email, password } = body;

  // Check if the user already exists
  const existingUser = await app.db.auth_users.getByEmail(email)

  assert(existingUser, 'auth/error', 401)

  // verify the password
  const verified = await phash.verify(existingUser.password, password);
  
  assert(verified, 'auth/error', 401)

  /** @type {Partial<import('./middle.auth.js').ApiRequest["user"]>} */
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

  return { 
    token_type: 'Bearer',
    user_id: existingUser.id,
    access_token, refresh_token
  }
}

/**
 * 
 * @param {App} app 
 * @param {import('../types.api.js').ApiAuthRefreshType} body 
 */  
export const refresh = async (app, body) => {
  assert_zod(apiAuthRefreshTypeSchema, body);

  const { refresh_token } = body;

  assert(refresh_token, 'auth/error', 400)

  // Check if the user already exists
  let { verified, claims } = await jwt.verify(
    app.platform.env.AUTH_SECRET_REFRESH_TOKEN, 
    refresh_token, true
  );

  // confirm it is indeed a refresh token
  verified = verified && claims?.aud==='/refresh';

  assert(verified, 'auth/error', 401)

  const access_token = await jwt.create(
    app.platform.env.AUTH_SECRET_ACCESS_TOKEN, 
    { 
      // @ts-ignore
      sub: claims.sub, roles: claims.roles 
    }, jwt.JWT_TIMES.HOUR
  );

  return {
    token_type: 'Bearer',
    user_id: access_token.claims.sub,
    access_token, 
    refresh_token: {
      token: refresh_token,
      claims: claims
    }
  }
}

