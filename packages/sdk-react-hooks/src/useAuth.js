import { useStorecraft } from "./useStorecraft.js";

export const useAuth = () => {

  const { 
    sdk 
  } = useStorecraft();


  return {
    /** @type {import("@storecraft/core/v-api").ApiAuthResult} */ 
    auth: sdk.auth?.currentAuth,
    isAuthenticated: sdk.auth?.isAuthenticated,
    actions: {
      signin : sdk.auth.signin, 
      signup : sdk.auth.signup, 
      signout : sdk.auth.signout
    }
  }
}
