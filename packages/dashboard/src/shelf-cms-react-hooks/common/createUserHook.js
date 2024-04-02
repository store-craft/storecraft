import { useEffect, useState } from "react"
import { StorecraftAdminSDK } from "@/admin-sdk/index.js"

/**
 * 
 * @param {() => StorecraftAdminSDK} getSdk 
 * @returns 
 */
export default function createUserHook(getSdk) {
  return () => {

    /** @type {[user: [import("@storecraft/core/v-api").ApiAuthResult, boolean], any]} */
    const [user, setUser] = useState([getSdk().auth.currentUser, getSdk().auth.isAuthenticated])
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
