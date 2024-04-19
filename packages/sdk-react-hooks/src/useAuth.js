import { useEffect } from "react";
import { useStorecraft } from "./useStorecraft.js";
import useTrigger from "./useTrigger.js";


/**
 * 
 * `useAuth` hook 
 * 
 */
export const useAuth = () => {

  const trigger = useTrigger();
  const { 
    sdk 
  } = useStorecraft();

  useEffect(
    () => {
      const unsub = sdk.auth.add_sub(
        trigger
      );

      sdk.auth.reAuthenticateIfNeeded();

      return unsub;

    }, []
  );

  return {
    /** @type {import("@storecraft/core/v-api").ApiAuthResult} */ 
    auth: sdk.auth.currentAuth,
    isAuthenticated: sdk.auth.isAuthenticated,
    actions: {
      signin : sdk.auth.signin, 
      signup : sdk.auth.signup, 
      signout : sdk.auth.signout
    }
  }
}
