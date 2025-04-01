/** 
 * @import { ApiRequest, ApiResponse } from './types.public.js' 
 * @import { Role } from "../api/types.api.js"; 
 */
import { App } from "../index.js";
import { verify } from "../crypto/jwt.js";
import { assert } from "../api/utils.func.js";
import { verify_api_key } from "../api/con.auth.logic.js";

export const Authorization = 'Authorization';
export const Bearer = 'Bearer';
export const Basic = 'Basic';
export const API_KEY_HEADER = 'X-API-KEY';

/** @param {any} o */
export const assert_generic_auth = (o) => {
  assert(o, 'auth/error', 401);
}

/**
 * 
 * @param {App} app 
 */
export const parse_auth_user = (app) => {
  /**
   * 
   * @param {ApiRequest} req 
   * @param {ApiResponse} [res={}] 
   */
  return async (req, res={}) => {
    await parse_bearer_auth(app)(req, res);
    await parse_basic_auth_or_apikey(app)(req, res);
  }
}

/**
 * 
 * @param {App} app 
 */
export const parse_bearer_auth = (app) => {
  /**
   * 
   * @param {Partial<ApiRequest>} req 
   * @param {Partial<ApiResponse>} [res={}] 
   */
  return async (req, res={}) => {
    if(req.user)
      return;

    const a = req?.headers?.get(Authorization);
    const token = a?.split(Bearer)?.at(-1).trim();

    if(!token)
      return;
    
    const jwt = await verify(
      app.config.auth_secret_access_token, 
      token, 
      true
    );

    // console.log({jwt});

    if(jwt.verified) 
      req.user = jwt.claims;
  }
}

/**
 * 
 * @param {App} app 
 */
export const parse_basic_auth_or_apikey = (app) => {
  /**
   * 
   * @param {ApiRequest} req 
   * @param {ApiResponse} [res={}] 
   */
  return async (req, res={}) => {
    if(req.user)
      return;

    const apikey_1 = req?.headers?.get(Authorization)?.split(Basic)?.at(-1).trim();
    const apikey_2 = req?.headers?.get(API_KEY_HEADER);
    const apikey = apikey_1 ?? apikey_2;

    if(!apikey)
      return;
    
    try {
      const auth_user = await verify_api_key(app)({ apikey });
      if(auth_user) {
        req.user = {
          sub: auth_user.id,
          email: auth_user.email,
          firstname: auth_user.firstname,
          lastname: auth_user.lastname,
          roles: auth_user.roles
        };
      }
    } catch (e) {

    }

  }
}


/**
 * 
 * @param {Role[]} roles 
 * @param {ApiRequest["user"]} user 
 */
export const has_role = (roles=[], user) => {
  return roles.length==0 || roles.some(
    r => (user?.roles ?? []).includes(r)
  );
}

/**
 * 
 * @param {ApiRequest["user"]} user 
 */
export const is_admin = (user) => {
  return has_role(['admin'], user);
}

/**
 * 
 * @param {Role[]} roles 
 */
export const roles_guard = (roles=[]) => {
  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} [res={}] 
   */
  return async (req, res={}) => {
    assert_generic_auth(req.user);

    const user_has_required_role = has_role(roles, req.user);
    if(!user_has_required_role) 
      assert_generic_auth(false);
  }  
}


/**
 * combine parse auth user with roles
 * @param {App} app 
 * @param {Role[]} roles 
 */
export const authorize_by_roles = (app, roles=[]) => {

  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} [res={}] 
   */  
  return async (req, res={}) => {
    await parse_auth_user(app)(req, res);
    await roles_guard(roles)(req, res);
  }    
}

/**
 * authorize admin only
 * @param {App} app 
 */
export const authorize_admin = (app) => {
  return authorize_by_roles(app, ['admin']);
}
