/**
 * @import { ApiAuthResult } from '@storecraft/core/api';
 */
import { useEffect } from "react";
import { useStorecraft } from "./use-storecraft.js";
import useTrigger from "./use-trigger.js";


/**
 * @description `useAuth` hook 
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

  const auth = (/** @type {ApiAuthResult} */  (
    sdk?.auth?.currentAuth));

  return {
    sdk,
    auth,
    contact: {
      email: auth?.access_token?.claims?.email,
      firstname: auth?.access_token?.claims?.firstname,
      lastname: auth?.access_token?.claims?.lastname,
      auth_id: auth?.user_id,
      customer_id: auth?.user_id?.replace('au_', 'cus_'),
    },
    isAuthenticated: sdk.auth.isAuthenticated,
    actions: {
      signin : sdk.auth.signin, 
      signup : sdk.auth.signup, 
      signout : sdk.auth.signout,
      refresh: sdk.auth.reAuthenticateIfNeeded, 
      changePassword: sdk.auth.changePassword,
      apikeys: {
        list: sdk.auth.list_api_keys_auth_users,
        create: sdk.auth.create_api_key
      },
      users: {
        get: sdk.auth.get_auth_user,
        remove: sdk.auth.remove_auth_user,
        list: sdk.auth.list_auth_users
      }
    }
  }
}
