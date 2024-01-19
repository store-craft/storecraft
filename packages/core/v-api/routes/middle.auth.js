import { App } from "../..";
import { verify } from "../../utils/jwt";

const Authorization = 'Authorization'
const Bearer = 'Bearer'
const auth_error = new Error(
  'auth-error', { cause: 401 }
);

/**
 * @typedef {import("../../types.public").ApiRequest} ApiRequest 
 * @typedef {import("../../types.public").ApiResponse} ApiResponse 
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
 * @param {import("../..").Role[]} roles 
 */
export const roles_guard = (roles=[]) => {

  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} res 
   */
  return async (req, res) => {
    if(!req.user) throw auth_error;
    const user_has_required_role = roles.length==0 || roles.some(
      r => (req?.user??[]).includes(r)
    );

    if(!user_has_required_role) throw auth_error;
  }  
}
 

/**
 * combine parse uath user with roles
 * @param {App} app 
 * @param {import("../..").Role[]} roles 
 */
export const authorize = (app, roles=[]) => {

  /**
   * @param {ApiRequest} req 
   * @param {ApiResponse} res 
   */  
  return async (req, res) => {
    await parse_auth_user(app)(req, res);
    await roles_guard(roles)(req, res);
  }    
}
