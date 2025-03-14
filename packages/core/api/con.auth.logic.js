/**
 * @import { 
 *  ApiAuthSignupType, ApiAuthResult, AuthUserType, ApiAuthChangePasswordType, 
 *  ApiAuthSigninType, ApiAuthRefreshType, ApiKeyResult
 * } from './types.api.js';
 * @import { ApiQuery } from './types.api.query.js'
 * @import { JWTClaims } from '../crypto/jwt.js'
 */
import * as jwt from '../crypto/jwt.js'
import { ID, apply_dates, assert, union } from './utils.func.js'
import { assert_zod } from './middle.zod-validate.js'
import { 
  apiAuthChangePasswordTypeSchema, apiAuthRefreshTypeSchema, 
  apiAuthSigninTypeSchema, apiAuthSignupTypeSchema 
} from './types.autogen.zod.api.js'
import { App } from '../index.js'
import { decode, encode, fromUint8Array } from '../crypto/base64.js'
import { isDef } from './utils.index.js'


export const CONFIRM_EMAIL_TOKEN = 'confirm-email-token';
export const FORGOT_PASSWORD_IDENTITY_TOKEN = 'forgot-password-identity-token';

/**
 * 
 * @param {AuthUserType} au 
 */
const sanitize_auth_user = (au) => {
  const sanitized = { ...au };
  delete sanitized.password;
  return sanitized;
}

/**
 * 
 * @param {App} app 
 */  
export const removeByEmail = (app) => 
/**
 * 
 * @param {string} email
 */
(email) => {
  return remove_auth_user(app)(email);
}

/**
 * 
 * @param {App} app 
 * @param {string} email 
 */  
const isAdminEmail = (app, email) => {
  return app.config.auth_admins_emails.includes(email);
}

/**
 * 
 * @param {App} app 
 * 
 */  
export const signup = (app) => 
/**
 * 
 * @param {ApiAuthSignupType} body 
 * 
 * @returns {Promise<ApiAuthResult>}
 */
async (body) => {

  assert_zod(apiAuthSignupTypeSchema, body);
  
  const { email, password, firstname, lastname } = body;
  
  // Check if the user already exists
  const existingUser = await app.db.resources.auth_users.getByEmail(email);

  assert(!existingUser, 'auth/already-signed-up', 400);

  const hashedPassword = await app.platform.crypto.hash(
    password
  );

  // Create a new user in the database
  const id = ID('au');
  const roles = isAdminEmail(app, email) ? ['admin'] : ['user'];
  const confirm_email_token = await jwt.create(
    app.config.auth_secret_access_token, 
    { sub: id, aud: CONFIRM_EMAIL_TOKEN },
    jwt.JWT_TIMES.WEEK
  );

  /** @type {AuthUserType} */
  const au = {
    id: id,
    email, 
    password: hashedPassword,
    confirmed_mail: false,
    roles,
    description: `This user is a created with roles: [admin]`,
    firstname,
    lastname,
    attributes: [
      {
        key: CONFIRM_EMAIL_TOKEN,
        value: confirm_email_token.token
      }
    ]
  }

  await upsert_auth_user(app)(au);

  // optional, but we set up a customer record directly into database
  // to avoid confusions
  await app.api.customers.upsert(
    {
      email: au.email,
      auth_id: au.id,
      id: 'cus_' + au.id.split('_')?.at(-1),
      firstname: firstname,
      lastname: lastname
    }
  );

  /** @type {Partial<JWTClaims>} */
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
    {
      ...claims, 
      aud: '/refresh'
    }, 
    jwt.JWT_TIMES.DAY * 7
  );

  { // dispatch event
    const sanitized = sanitize_auth_user(au);

    if(app.pubsub.has('auth/signup')) {
      await app.pubsub.dispatch(
        'auth/signup',
        sanitize_auth_user(au)
      );
    }

    await app.pubsub.dispatch(
      'auth/confirm-email-token-generated',
      {
        auth_user: sanitized,
        token: confirm_email_token.token,
      }
    );

  }

  return {
      token_type: 'Bearer',
      user_id: id,
      access_token, refresh_token
  }
}


/**
 * 
 * @param {App} app 
 */  
export const change_password = (app) => 
/**
 * 
 * @param {ApiAuthChangePasswordType} body 
 * 
 * @returns {Promise<ApiAuthResult>}
 */
async (body) => {
  assert_zod(apiAuthChangePasswordTypeSchema, body);

  // Check if the user already exists
  let existingUser = await app.db.resources.auth_users.get(body.user_id_or_email);

  assert(existingUser, 'auth/error', 401)

  { // verify the current password
    const verified = await app.platform.crypto.verify(
      existingUser.password, body.current_password
    );
    
    assert(verified, 'auth/error', 401);
  }
  

  // verify the new password matches the confirmed one

  assert(
    (body?.new_password?.length ?? 0) > 3, 
    'new password should be longer than 3 characters', 401
  );

  assert(
    body.new_password===body.confirm_new_password, 
    'new password does not match the confirmed password', 401
  );

    // Hash the password using pbkdf2
  const hashedPassword = await app.platform.crypto.hash(
    body.new_password
  );

  // Upsert new hashed password
  await upsert_auth_user(app)(
    {
      ...existingUser,
      password: hashedPassword
    }
  );

  /** 
   * @type {Partial<Partial<JWTClaims> & 
   * Pick<AuthUserType, 'roles'>> } 
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

  { // dispatch event
    if(app.pubsub.has('auth/change-password')) {
      await app.pubsub.dispatch(
        'auth/change-password',
        sanitize_auth_user(existingUser)
      );
    }
  }

  return { 
    token_type: 'Bearer',
    user_id: existingUser.id,
    access_token, refresh_token
  }
}


/**
 * 
 * @param {App} app 
 */  
export const signin = (app) => 
/**
 * 
 * @param {ApiAuthSigninType} body 
 * @param {boolean} [fail_if_not_admin=false] 
 * 
 * 
 * @returns {Promise<ApiAuthResult>}
 */
async (body, fail_if_not_admin=false) => {
  assert_zod(apiAuthSigninTypeSchema, body);

  const { email, password } = body;

  // Check if the user already exists
  let existingUser = await app.db.resources.auth_users.getByEmail(email);
  const isAdmin = isAdminEmail(app, email);
  // An admin first login will register the default `admin` password
  if(!existingUser && isAdmin) {
    await signup(app)({ ...body, password: 'admin' });
    existingUser = await app.db.resources.auth_users.getByEmail(email);
  }

  assert(isAdmin || !fail_if_not_admin, 'auth/error', 401)
  assert(existingUser, 'auth/error', 401)

  // verify the password
  const verified = await app.platform.crypto.verify(
    existingUser.password, password
  );
  
  assert(verified, 'auth/error', 401);

  /** 
   * @type {Partial<Partial<JWTClaims> & 
   * Pick<AuthUserType, 'roles'>> } 
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

  { // dispatch event
    if(app.pubsub.has('auth/signin')) {
      await app.pubsub.dispatch(
        'auth/signin',
        sanitize_auth_user(existingUser)
      );
    }
  }

  return { 
    token_type: 'Bearer',
    user_id: existingUser.id,
    access_token, refresh_token
  }
}

/**
 * 
 * @param {App} app 
 */  
export const refresh = (app) => 
/**
 * 
 * @param {ApiAuthRefreshType} body 
 * 
 * @returns {Promise<ApiAuthResult>}
 */
async (body) => {
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
 * @param {AuthUserType} item 
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
 */  
export const create_api_key = (app) => 
/**
 * 
 * @returns {Promise<ApiKeyResult>}
 */
async () => {

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
  const hashedPassword = await app.platform.crypto.hash(
    password
  );

  // Create a new user in the database
  const id = ID('au');

  // this is just `email`
  const email = `${id}@apikey.storecraft.app`;

  /** @type {AuthUserType} */
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

  await upsert_auth_user(app)(au);

  const apikey = encode(`${email}:${password}`, true);

  await app.pubsub.dispatch('auth/apikey-created', au);

  return {
    apikey
  }
}

/**
 * 
 * @param {ApiKeyResult} body 
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
 */  
export const verify_api_key = (app) => 
/**
 * 
 * @param {ApiKeyResult} body 
 * 
 * @returns {Promise<AuthUserType>}
 */
async (body) => {

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
  const verified = await app.platform.crypto.verify(
    apikey_user.password, password
  );

  assert(
    verified, 'auth/error'
  )

  return sanitize_auth_user(apikey_user);
}

/**
 * 
 * List all of the api keys
 * 
 * 
 * @param {App} app 
 * 
 */  
export const list_all_api_keys_info = (app) => 
async () => {

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
 */  
export const list_auth_users = (app) => 
/**
 * @param {ApiQuery<AuthUserType>} [query={}] 
 */
async (query={}) => {

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
 */  
export const get_auth_user = (app) => 
/**
 * 
 * @param {string} id_or_email 
 */
async (id_or_email) => {

  return app.db.resources.auth_users.get(
    id_or_email
  );
}


/**
 * @description `upsert` an auth user and dispatch `auth/upsert` event
 * 
 * @param {App} app 
 */  
export const upsert_auth_user = (app) => 
  /**
   * 
   * @param {AuthUserType} item 
   */
  async (item) => {

    const final = apply_dates(item);

    await app.db.resources.auth_users.upsert(
      final,
      create_search_terms(final)
    );

    await app.pubsub.dispatch(
      'auth/upsert', sanitize_auth_user(final)
    );
  }
  

/**
 * 
 * @param {App} app 
 */  
export const remove_auth_user = (app) => 
/**
 * 
 * @param {string} id_or_email 
 */
async (id_or_email) => {

  { // dispatch event
    if(app.pubsub.has('auth/remove')) {
      const user_to_remove = await app.db.resources.auth_users.get(
        id_or_email
      );

      await app.pubsub.dispatch(
        'auth/remove',
        sanitize_auth_user(user_to_remove)
      );
    }
  }

  await app.db.resources.auth_users.remove(
    id_or_email
  );

}


/////
// Verification tokens
/////

/**
 * @description confirm `email` of authenticated user
 * 
 * @param {App} app 
 */  
export const confirm_email = (app) => 
  /**
   * 
   * @param {string} token confirm email token
   */
  async (token) => {
  
    const  { 
      verified, claims
    } = await jwt.verify(app.config.auth_secret_access_token, token);
    
    assert(verified, 'auth/error');
    assert(claims.aud===CONFIRM_EMAIL_TOKEN, 'auth/error');

    const auth_id = claims.sub;
    const au = await app.db.resources.auth_users.get(auth_id);

    au.confirmed_mail = true;

    await upsert_auth_user(app)(au);

    { // dispatch event
      await app.pubsub.dispatch(
        'auth/confirm-email-token-confirmed',
        sanitize_auth_user(au)
      );
    }
  
  }
  

/**
 * @description request a `forgot-password` workflow:
 * - generate a special `token`
 * - emit a `auth/forgot-password-token-generated` with the `token` payload.
 * - the app will need to respons to the vent and send a private email with the token
 * or a link with the token
 * - customers clicks the link from his email to confirm, that it was him
 * - this hit another endpoint which verifies/confirms
 * - password is changed to a random password.
 * - the app sends a private email with the random password to the customer.
 * - now, the customer can login and update to another password
 * 
 * @param {App} app 
 */  
export const forgot_password_request = (app) => 
  /**
   * 
   * @param {string} email confirm email token
   */
  async (email) => {
  
    // we do not verify the email in database, so it will not
    // become a heavy DDos event
    const token = await jwt.create(
      app.config.auth_secret_access_token, 
      { sub: email, aud: FORGOT_PASSWORD_IDENTITY_TOKEN },
      jwt.JWT_TIMES.HOUR
    );

    { // dispatch event
      await app.pubsub.dispatch(
        'auth/forgot-password-token-generated',
        { 
          auth_user: {
            email
          }, 
          token: token.token 
        }
      );
    }
  
  }
  
/**
 * @description User has supplied the `token` generated by the {@link forgot_password_request},
 * - a new random password will be generated and setup for him
 * - we will inform the user
 * 
 * @param {App} app 
 */  
export const forgot_password_request_confirm = (app) => 
  /**
   * 
   * @param {string} token forgot password identity token
   */
  async (token) => {
  
    const  { 
      verified, claims
    } = await jwt.verify(app.config.auth_secret_access_token, token);
    
    assert(verified, 'auth/error');
    assert(claims.aud===FORGOT_PASSWORD_IDENTITY_TOKEN, 'auth/error');

    const auth_id_or_email = claims.sub;
    const au = await app.db.resources.auth_users.get(auth_id_or_email);

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
    const hashedPassword = await app.platform.crypto.hash(
      password
    );

    au.password = hashedPassword;
  
    await upsert_auth_user(app)(au);

    { // dispatch event
      await app.pubsub.dispatch(
        'auth/forgot-password-token-confirmed',
        sanitize_auth_user(au)
      );
    }

    return {
      email: au.email,
      password,
    }
  
  }
    

/**
 * 
 * @param {App} app 
 */
export const inter = app => {

  return {
    signin: signin(app),
    signup: signup(app),
    change_password: change_password(app),
    refresh: refresh(app),

    create_api_key: create_api_key(app),
    list_all_api_keys_info: list_all_api_keys_info(app),
    parse_api_key: parse_api_key,
    verify_api_key: verify_api_key(app),

    get_auth_user: get_auth_user(app),
    upsert_auth_user: upsert_auth_user(app),
    remove_auth_user: remove_auth_user(app),
    removeByEmail: removeByEmail(app),
    list_auth_users: list_auth_users(app),

    confirm_email: confirm_email(app),
    forgot_password_request: forgot_password_request(app),
    forgot_password_request_confirm: forgot_password_request_confirm(app),
  }

}