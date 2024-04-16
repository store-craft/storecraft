import { useEffect, useState } from "react";
import useTrigger from "./useTrigger.js";

/**
 * A simple `react` hook to get access to `sdk`
 * with realtime reports about `auth`
 * 
 */
export const useSDK = () => {
  const { sdk } = useStorecraft();
  const [isInit, setIsInit] = useState(false)
  const [isAuth, setIsAuth] = useState(undefined)
  const trigger = useTrigger()

  useEffect(
    () => {
      try {
        const sdk = sdk
        if(sdk.auth.isAuthenticated)
          setIsAuth(true)

        const unsub = sdk.auth.add_sub(
          ([user, isAuth]) => {
            setIsAuth(isAuth)
          }
        );

        setIsInit(true)

        return unsub
      } catch (e) {
        setIsInit(false)
        console.log('Storecraft Error ', e)
      }
    }, [trigger]
  );

  return {
    isInit, isAuth, 
    sdk: isInit ? sdk : undefined, 
    trigger
  }
}
