import { useEffect, useState } from "react"
import { StorecraftAdminSDK } from "@storecraft/sdk"

/**
 * 
 * @param {() => StorecraftAdminSDK} getSdk 
 */
export default function createUserHook(getSdk) {
  return () => {

    /** 
     * @type {ReturnType<typeof useState<
     *  [import("@storecraft/core/v-api").ApiAuthResult, boolean]>>
     * } 
     */
    const [user, setUser] = useState([
      getSdk().auth.currentUser, getSdk().auth.isAuthenticated
    ]);
    
    // console.log('update ', getShelf().auth.currentUser, getShelf().auth.isAuthenticated);
  
    useEffect(() => {
      return getSdk().auth.add_sub(setUser)
    }, [getSdk])
    
    /** @type {import("@storecraft/core/v-api").ApiAuthResult} */
    const active_user = user[0];

    return {
      user: user[0],
      isAuthenticated: user[1],
      actions: {
        signin : getSdk().auth.signin_with_email_pass, 
        signout : getSdk().auth.signout
      }
    }
  }
}
