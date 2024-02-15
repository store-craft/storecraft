import { assert } from './utils.func.js'
import { auth_error, has_role } from './con.auth.middle.js'
import { isDef } from './utils.index.js'

/**
 * @param {import('./con.auth.middle.js').ApiRequest} req 
 * @param {import('./con.auth.middle.js').ApiResponse} res 
 */
export const owner_or_admin_guard = async (req, res) => {
  assert(req.user, ...auth_error);

  const is_admin = has_role(['admin'], req.user);
  const is_owner = isDef(req.user.sub) && req.parsedBody.id===req.user.sub;
  assert(is_admin || is_owner, ...auth_error);
}  
