import { assert_generic_auth, has_role } from './con.auth.middle.js'
import { isDef } from '../v-api/utils.index.js'

/**
 * @param {import('../types.public.js').ApiRequest} req 
 * @param {import('../types.public.js').ApiResponse} res 
 */
export const owner_or_admin_guard = async (req, res) => {
  assert_generic_auth(req.user);

  const is_admin = has_role(['admin'], req.user);
  // customer id postfix is auth id postfix
  const is_owner = isDef(req.user.sub) && 
          req.parsedBody?.id?.split('_')?.at(-1)===req.user?.sub?.split('_')?.at(-1);
  assert_generic_auth(is_admin || is_owner);
}  
