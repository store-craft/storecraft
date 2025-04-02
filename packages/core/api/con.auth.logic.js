/**
 * @import { 
 *  ApiAuthSignupType, ApiAuthResult, AuthUserType, ApiAuthChangePasswordType, 
 *  ApiAuthSigninType, ApiAuthRefreshType, ApiKeyResult, JWTClaims
 * } from './types.api.js';
 * @import { ApiQuery } from './types.api.query.js'
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
import { 
  create_auth_uri, identity_providers, sign_with_identity_provider 
} from './con.auth.idp.logic.js'

export const CONFIRM_EMAIL_TOKEN = 'confirm-email-token';
export const FORGOT_PASSWORD_IDENTITY_TOKEN = 'forgot-password-identity-token';

/**
 * @description Sanitize the `auth_user` object
 * @param {AuthUserType} au 
 */
export const sanitize_auth_user = (au) => {
  const sanitized = { ...au };
  delete sanitized.password;
  return sanitized;
}

/**
 * @param {App} app 
 */  
export const removeByEmail = (app) => 
/**
 * @description Remove an auth user by `email`
 * @param {string} email
 */
(email) => {
  return remove_auth_user(app)(email);
}

/**
 * @description Check if the email is an admin email
 * @param {App} app 
 * @param {string} email 
 */  
export const isAdminEmail = (app, email) => {
  return app.config.auth_admins_emails.includes(email);
}

/**
 * @param {App} app 
 */  
export const signup = (app) => 
/**
 * @description Signup a new user with `email`, `password`, `firstname`, `lastname`
 * @param {ApiAuthSignupType} body 
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
    app.config.auth_secret_confirm_email_token, 
    { sub: id, aud: CONFIRM_EMAIL_TOKEN },
    jwt.JWT_TIMES.WEEK
  );

  /** @type {AuthUserType} */
  const au = {
    id: id,
    email, 
    handle: email,
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
      },
      {
        key: 'firstname',
        value: firstname?.slice(0, 20)
      },
      {
        key: 'lastname',
        value: lastname?.slice(0, 20)
      },
    ]
  }

  await upsert_auth_user(app)(au);

  // optional, but we set up a customer record directly into database
  // to avoid confusions
  await app.api.customers.upsert(
    {
      email: au.email,
      handle: au.email,
      auth_id: au.id,
      id: 'cus_' + au.id.split('_')?.at(-1),
      firstname: firstname,
      lastname: lastname
    }
  );

  /** @type {Partial<JWTClaims>} */
  const claims = {
    sub: id, 
    roles,
    email,
    firstname, 
    lastname  
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
 * @param {App} app 
 */  
export const change_password = (app) => 
/**
 * @description Change the password of a user
 * @param {ApiAuthChangePasswordType} body 
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
    roles: existingUser.roles,
    email: existingUser.email,
    firstname: existingUser.firstname,
    lastname: existingUser.lastname
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
 * @param {App} app 
 */  
export const signin = (app) => 
/**
 * @description Signin a user with `email` and `password`
 * @param {ApiAuthSigninType} body 
 * @param {boolean} [fail_if_not_admin=false] 
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
  assert(existingUser && existingUser.password, 'auth/error', 401)

  // verify the password
  const verified = await app.platform.crypto.verify(
    existingUser.password, password
  );
  
  assert(verified, 'auth/error', 401);

  /** 
   * @type {Partial<JWTClaims>} 
   */
  const claims = {
    sub: existingUser.id,
    roles: existingUser.roles,
    email,
    firstname: existingUser.firstname,
    lastname: existingUser.lastname
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
 * @param {App} app 
 */  
export const refresh = (app) => 
/**
 * @description Refresh the `access_token` with the `refresh_token`
 * @param {ApiAuthRefreshType} body 
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
      ...claims,
    }, jwt.JWT_TIMES.HOUR
  );

  const api_auth_result =  {
    token_type: 'Bearer',
    user_id: access_token.claims.sub,
    access_token, 
    refresh_token: {
      token: refresh_token,
      claims: claims
    }
  }

  { // dispatch event
    if(app.pubsub.has('auth/refresh')) {
      await app.pubsub.dispatch(
        'auth/refresh',
        api_auth_result
      );
    }
  }

  return api_auth_result;
}


/**
 * @description Compute the search terms of an `auth_user`
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
 * @param {App} app 
 */  
export const create_api_key = (app) => 
/**
 * @description Create a new `apikey` and dispatch `auth/apikey-created` event
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
    handle: email,
    password: hashedPassword,
    confirmed_mail: false,
    roles: ['admin'],
    tags: ['apikey'],
    active: true,
    description: `This user is a created apikey with roles: [admin]`
  }

  await upsert_auth_user(app)(au);

  const apikey = encode(`${email}:${password}`, true);

  await app.pubsub.dispatch(
    'auth/apikey-created', au
  );

  return {
    apikey
  }
}

export const email_password_to_basic = (email='', password='') => {
  const a = `${email}:${password}`;
  return encode(a, true);
}

/**
 * @description Parse the `apikey` into `email` and `password`
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
 * @param {App} app 
 */  
export const verify_api_key = (app) => 
 /**
  * @description Verifying `apikey` is slow, because we need to consult
  * with the database every time.
  * @param {ApiKeyResult} body 
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
 * @param {App} app 
 */  
export const list_all_api_keys_info = (app) => 
  /**
   * @description List all of the api keys
   */
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
 * @param {App} app 
 */  
export const list_auth_users = (app) => 
/**
 * @description List and query auth users
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
 * @param {App} app 
 */  
export const get_auth_user = (app) => 
/**
 * @description Get an auth user by `id` or `email`
 * @param {string} id_or_email 
 */
async (id_or_email) => {

  return app.db.resources.auth_users.get(
    id_or_email
  );
}


/**
 * @param {App} app 
 */  
export const upsert_auth_user = (app) => 
  /**
   * @description `upsert` an auth user and dispatch `auth/upsert` event
   * 
   * @param {AuthUserType} item 
   */
  async (item) => {

    const final = apply_dates(item);

    const success = await app.db.resources.auth_users.upsert(
      final,
      create_search_terms(final)
    );

    await app.pubsub.dispatch(
      'auth/upsert', sanitize_auth_user(final)
    );

    return success;
  }
  

/**
 * @param {App} app 
 */  
export const remove_auth_user = (app) => 
/**
 * @description remove an auth user and dispatch `auth/remove` event
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

  return await app.db.resources.auth_users.remove(
    id_or_email
  );

}


/////
// Verification tokens
/////

/**
 * @param {App} app 
 */  
export const confirm_email = (app) => 
  /**
   * @description confirm `email` of authenticated user
   * 
   * @param {string} token confirm email token
   */
  async (token) => {
  
    const  { 
      verified, claims
    } = await jwt.verify(
      app.config.auth_secret_confirm_email_token, 
      token, true
    );
    
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
 * @param {App} app 
 */  
export const forgot_password_request = (app) => 
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
   * @param {string} email confirm email token
   */
  async (email) => {
  
    // we do not verify the email in database, so it will not
    // become a heavy DDos event
    const token = await jwt.create(
      app.config.auth_secret_forgot_password_token, 
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
 * @param {App} app 
 */  
export const forgot_password_request_confirm = (app) => 
  /**
   * @description User has supplied the `token` generated by the {@link forgot_password_request},
   * - a new random password will be generated and setup for him
   * - we will inform the user
   * @param {string} token forgot password identity token
   */
  async (token) => {
  
    const  { 
      verified, claims
    } = await jwt.verify(app.config.auth_secret_forgot_password_token, token);
    
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
 * @param {App} app
 */
export const count = (app) => 
  /**
   * @description Count query results
   * 
   * @param {ApiQuery<AuthUserType>} query 
   */
  (query) => {
    return app.db.resources.auth_users.count(query);
  }
  

/**
 * @template {App} T
 * @param {T} app 
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
    count: count(app),

    confirm_email: confirm_email(app),
    forgot_password_request: forgot_password_request(app),
    forgot_password_request_confirm: forgot_password_request_confirm(app),

    identity_provider_create_auth_uri: create_auth_uri(app),
    identity_provider_sign_with: sign_with_identity_provider(app),
    identity_providers_list: identity_providers(app)
  }

}