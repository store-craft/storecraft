import * as phash from '../v-crypto/crypto-pbkdf2.js'
import * as jwt from '../v-crypto/jwt.js'
import { ID, apply_dates, assert, union } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { apiAuthRefreshTypeSchema, apiAuthSigninTypeSchema, 
  apiAuthSignupTypeSchema } from './types.autogen.zod.api.js'
import { App } from '../index.js'
import { decode, encode, fromUint8Array } from '../v-crypto/base64.js'
import { isDef } from './utils.index.js'


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
 * 
 * 
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

  /** @type {import('./types.api.js').AuthUserType} */
  const au = {
    id: id,
    email, 
    password: hashedPassword,
    confirmed_mail: false,
    roles,
    description: `This user is a created with roles: [admin]`
  }

  await app.db.resources.auth_users.upsert(
    apply_dates(au),
    create_search_terms(au)
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
 * 
 * 
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
 * 
 * 
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


/**
 * 
 * Compute the search terms of an `auth_user`
 * 
 * @param {import('./types.api.js').AuthUserType} item 
 */
export const create_search_terms = item => {
  return union(
    isDef(item.active) && `email:${item.active}`,
    isDef(item.email) && `email:${item.email}`,
    isDef(item.email) && item.email,
    `confirmed_mail:${item.confirmed_mail ?? false}`,
    (item.tags ?? []).map(tag => `tag:${tag}`),
    item.id,
    (item.roles ?? []).map(role => `role:${role}`),
  ).filter(Boolean)
}

/**
 * 
 * @param {App} app 
 * 
 * 
 * @returns {Promise<import('./types.api.js').ApiKeyResult>}
 */  
export const create_api_key = async (app) => {

  const key = await crypto.subtle.generateKey(
    {
      name: "HMAC",
      hash: {
        name: "SHA-256"
      }
    },
    true,
    ["sign", "verify"]
  );

  const exported = await crypto.subtle.exportKey("raw", key);
  const ui8a = new Uint8Array(exported);
  const password = fromUint8Array(ui8a, true);

  // Hash the password using pbkdf2
  const hashedPassword = await phash.hash(
    password, app.config.auth_password_hash_rounds
  );

  // Create a new user in the database
  const id = ID('au');

  // this is just `email`
  const email = `${id}@apikey.storecraft.api`;

  /** @type {import('./types.api.js').AuthUserType} */
  const au = {
    id,
    email, 
    password: hashedPassword,
    confirmed_mail: false,
    roles: ['admin'],
    tags: ['apikey'],
    active: true,
    description: `This user is a created apikey with roles: [admin]`
  }

  await app.db.resources.auth_users.upsert(
    apply_dates(au),
    create_search_terms(au)
  );

  const apikey = encode(`${email}:${password}`, true);

  return {
    apikey
  }
}

/**
 * 
 * @param {import('./types.api.js').ApiKeyResult} body 
 */
export const parse_api_key = (body) => {
  const a = decode(body.apikey);
  const parts = a.split(':');
  const email = parts?.[0];
  const password = parts?.[1];

  return {
    email,
    password,
  }
}


/**
 * 
 * Verifying `apikey` is slow, because we need to consult
 * with the database every time.
 * 
 * @param {App} app 
 * @param {import('./types.api.js').ApiKeyResult} body 
 * 
 * 
 * @returns {Promise<import('./types.api.js').AuthUserType>}
 */  
export const verify_api_key = async (app, body) => {

  const {
    email, password
  } = parse_api_key(body);

  const apikey_user = await app.db.resources.auth_users.getByEmail(
    email
  );

  assert(
    apikey_user, 'auth/error'
  );

  // verify the password
  const verified = await phash.verify(
    apikey_user.password, password
  );
 
  assert(
    verified, 'auth/error'
  )

  return apikey_user;
}

/**
 * 
 * List all of the api keys
 * 
 * 
 * @param {App} app 
 * 
 */  
export const list_all_api_keys_info = async (app) => {

  const apikeys = await app.db.resources.auth_users.list(
    {
      vql: 'tag:apikey',
      limit: 1000,
      expand: ['*']
    }
  );

  for(const item of apikeys) {
    delete item['password'];
  }

  return apikeys
}


/**
 * 
 * Query auth users.
 * 
 * 
 * @param {App} app 
 * @param {import('./types.api.query.js').ApiQuery} [query={}] 
 * 
 */  
export const list_auth_users = async (app, query={}) => {

  const items = await app.db.resources.auth_users.list(
    query
  );

  for(const item of items) {
    delete item['password'];
  }

  return items;
}



/**
 * 
 * @param {App} app 
 * @param {string} id_or_email 
 * 
 */  
export const remove_auth_user = async (app, id_or_email) => {

  await app.db.resources.auth_users.remove(
    id_or_email
  );
}
