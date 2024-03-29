import { App } from "../index.js";
import { verify } from "../v-crypto/jwt.js";
import { assert } from "../v-api/utils.func.js";

const Authorization = 'Authorization'
const Bearer = 'Bearer'

/** @param {any} o */
export const assert_generic_auth = (o) => {
  assert(o, 'auth/error', 401);
}

/**
 * @typedef {import("../types.public.js").ApiRequest} ApiRequest 
 * @typedef {import("../types.public.js").ApiResponse} ApiResponse 
 */

/**
 * 
 * @param {App} app 
 */
export const parse_auth_user = (app) => {
  /**
   * 
   * @param {ApiRequest} req 
   * @param {ApiResponse} res 
   */
  return async (req, res) => {
    const a = req.headers.get(Authorization);
    const token = a?.split(Bearer)?.at(-1).trim();

    if(!token)
      return;
    
    const jwt = await verify(
      app.platform.env.AUTH_SECRET_ACCESS_TOKEN, token, true
    );

    if(jwt.verified)
     req.user = jwt.claims;
  }
}

/**
 * 
 * @param {import("../v-api/types.api.js").Role[]} roles 
 * @param {ApiRequest["user"]} user 
 */
export const has_role = (roles=[], user) => {
  return roles.length==0 || roles.some(
    r => (user.roles ?? []).includes(r)
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
 * @param {import("../v-api/types.public.js").Role[]} roles 
 */
export const roles_guard = (roles=[]) => {
  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} res 
   */
  return async (req, res) => {
    assert_generic_auth(req.user);

    const user_has_required_role = has_role(roles, req.user);
    if(!user_has_required_role) assert_generic_auth(false);
  }  
}


/**
 * combine parse auth user with roles
 * @param {App} app 
 * @param {import("../v-api/types.public.js").Role[]} roles 
 */
export const authorize_by_roles = (app, roles=[]) => {

  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} res 
   */  
  return async (req, res) => {
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
