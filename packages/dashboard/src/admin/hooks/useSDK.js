import { useEffect, useState } from "react";
import useTrigger from "./useTrigger.js";
import { getSDK } from "@/admin-sdk/index.js";

/**
 * A simple `react` hook to get access to `sdk`
 * with realtime reports about `auth`
 * 
 */
export const useSDK = () => {
  const [isInit, setIsInit] = useState(false)
  const [isAuth, setIsAuth] = useState(undefined)
  const trigger = useTrigger()

  useEffect(
    () => {
      try {
        const sdk = getSDK()
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
    }, [trigger, getSDK]
  );

  return {
    isInit, isAuth, 
    sdk: isInit ? getSDK() : undefined, 
    trigger
  }
}
