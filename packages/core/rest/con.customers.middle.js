/**
 * @import { ApiRequest, ApiResponse } from './types.public.js'
 */
import { assert_generic_auth, has_role } from './con.auth.middle.js';
import { isDef } from '../api/utils.index.js';

/**
 * @param {ApiRequest} req 
 * @param {ApiResponse} res 
 */
export const owner_or_admin_guard = async (req, res) => {
  assert_generic_auth(req.user);

  const is_admin = has_role(['admin'], req.user);
  /** @type {{email_or_id?: string}} */
  const params = req?.params;
  /** @type {import('../api/types.api.js').CustomerType} */
  const parsedBody = req?.parsedBody;

  // we combine two use cases.
  // 1. when api path param reveals the email or id of the user (on get, delete, put)
  // 2. when api body param reveals the email of the user (on upsert)
  const is_owner = (
    (req.user.email && req.user.email===params?.email_or_id) ||
    (req.user.id && req.user.id===params?.email_or_id)
  ) || (
    parsedBody && req.user.email && 
    req.user.email===parsedBody?.email
  );

  assert_generic_auth(is_admin || is_owner);
}  
