import { App } from "../index.js";
import { verify } from "../utils/jwt.js";
import { assert } from "./utils.func.js";

const Authorization = 'Authorization'
const Bearer = 'Bearer'
export const auth_error = [
  'auth/error', 401
];

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
 * @param {import("../types.public.js").Role[]} roles 
 * @param {ApiRequest["user"]} user 
 */
export const has_role = (roles, user) => {
  return roles.length==0 || roles.some(
    r => (user.roles ?? []).includes(r)
  );
}

/**
 * 
 * @param {import("../types.public.js").Role[]} roles 
 */
export const roles_guard = (roles=[]) => {
  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} res 
   */
  return async (req, res) => {
    assert(req.user, ...auth_error);

    const user_has_required_role = has_role(roles, req.user);
    if(!user_has_required_role) assert(false, ...auth_error);
  }  
}


/**
 * combine parse uath user with roles
 * @param {App} app 
 * @param {import("../types.public.js").Role[]} roles 
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
