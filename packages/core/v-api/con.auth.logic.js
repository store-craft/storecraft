import * as phash from '../v-crypto/crypto-pbkdf2.js'
import * as jwt from '../v-crypto/jwt.js'
import { ID, apply_dates, assert } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { apiAuthRefreshTypeSchema, apiAuthSigninTypeSchema, 
  apiAuthSignupTypeSchema } from './types.autogen.zod.api.js'
import { App } from '../index.js'


/**
 * 
 * @param {App} app 
 * @param {string} id
 */  
export const removeById = async (app, id) => {
  return app.db.resources.auth_users.remove(id);
}

/**
 * 
 * @param {App} app 
 * @param {string} email
 */  
export const removeByEmail = async (app, email) => {
  return app.db.resources.auth_users.removeByEmail(email);
}

/**
 * 
 * @param {App} app 
 * @param {string} email 
 */  
const isAdminEmail = (app, email) => {
  return app.config.admins_emails.includes(email);
}

/**
 * 
 * @param {App} app 
 * @param {import('./types.api.js').ApiAuthSignupType} body 
 * @returns {Promise<import('./types.api.js').ApiAuthResult>}
 */  
export const signup = async (app, body) => {

  assert_zod(apiAuthSignupTypeSchema, body);
  
  const { email, password } = body;
  
  // Check if the user already exists
  const existingUser = await app.db.resources.auth_users.getByEmail(email)

  assert(!existingUser, 'auth/already-signed-up', 400)

  // Hash the password using pbkdf2
  const hashedPassword = await phash.hash(
    password, app.config.auth_password_hash_rounds
  );

  // Create a new user in the database
  const id = ID('au');
  const roles = isAdminEmail(app, email) ? ['admin'] : ['user'];

  await app.db.resources.auth_users.upsert(
    apply_dates(
      {
        id: id,
        email, password: hashedPassword,
        confirmed_mail: false,
        roles
      }
    )
  );

  /** @type {Partial<import("../v-crypto/jwt.js").JWTClaims>} */
  const claims = {
    sub: id, 
    // @ts-ignore
    roles
  };

  const access_token = await jwt.create(
    app.config.auth_secret_access_token,
    claims, jwt.JWT_TIMES.HOUR
  );

  const refresh_token = await jwt.create(
    app.config.auth_secret_refresh_token, 
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
 * @param {import('./types.api.js').ApiAuthSigninType} body 
 * @param {boolean} [fail_if_not_admin=false] 
 * @returns {Promise<import('./types.api.js').ApiAuthResult>}
 */  
export const signin = async (app, body, fail_if_not_admin=false) => {
  assert_zod(apiAuthSigninTypeSchema, body);

  const { email, password } = body;

  // Check if the user already exists
  let existingUser = await app.db.resources.auth_users.getByEmail(email);
  const isAdmin = isAdminEmail(app, email);
  // An admin first login will register the default `admin` password
  if(!existingUser && isAdmin) {
    await signup(app, { ...body, password: 'admin' });
    existingUser = await app.db.resources.auth_users.getByEmail(email);
  }

  assert(isAdmin || !fail_if_not_admin, 'auth/error', 401)
  assert(existingUser, 'auth/error', 401)

  // verify the password
  const verified = await phash.verify(
    existingUser.password, password
    );
  
  assert(verified, 'auth/error', 401)

  /** 
   * @type {Partial<Partial<import('../v-crypto/jwt.js').JWTClaims> & 
   * Pick<import('./types.api.js').AuthUserType, 'roles'>> } 
   */
  const claims = {
    sub: existingUser.id,
    roles: existingUser.roles
  }

  const access_token = await jwt.create(
    app.config.auth_secret_access_token, 
    claims, jwt.JWT_TIMES.HOUR
  );

  const refresh_token = await jwt.create(
    app.config.auth_secret_refresh_token, 
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
 * @param {import('./types.api.js').ApiAuthRefreshType} body 
 * @returns {Promise<import('./types.api.js').ApiAuthResult>}
 */  
export const refresh = async (app, body) => {
  assert_zod(apiAuthRefreshTypeSchema, body);

  const { refresh_token } = body;

  assert(refresh_token, 'auth/error', 400)

  // Check if the user already exists
  let { verified, claims } = await jwt.verify(
    app.config.auth_secret_refresh_token, 
    refresh_token, true
  );

  // confirm it is indeed a refresh token
  verified = verified && claims?.aud==='/refresh';

  assert(verified, 'auth/error', 401)

  const access_token = await jwt.create(
    app.config.auth_secret_access_token, 
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

