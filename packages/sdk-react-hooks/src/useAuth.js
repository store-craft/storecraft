import { useStorecraft } from "./useStorecraft.js";

export const useAuth = () => {

  const { 
    sdk 
  } = useStorecraft();

  return {
    user: sdk.auth?.currentAuth,
    isAuthenticated: sdk.auth?.isAuthenticated,
    actions: {
      signin : sdk.auth.signin, 
      signout : sdk.auth.signout
    }
  }
}
