import { useCallback, useEffect, useState } from "react";
import useTrigger from "./useTrigger.js";
import { StorecraftSDK } from "@storecraft/sdk";
import { LS } from "./utils.browser.js";

const CONFIG_KEY = `storecraft_latest_config`;

/**
 * 
 * @returns {import("@storecraft/sdk").StorecraftSDKConfig}
 */
export const getLatestConfig = () => {
  return sdk?.config ?? LS.get(CONFIG_KEY);
}


/**
 * @type {StorecraftSDK}
 */
var sdk = new StorecraftSDK();


/**
 * 
 * @param {import("@storecraft/sdk").StorecraftSDKConfig} [config]
 */
const save_config = (config={}) => {
  LS.set(CONFIG_KEY, config);
}



/**
 * @param {import("@storecraft/sdk").StorecraftSDKConfig} config 
 */
const internal_updateConfig = (config) => {
  sdk.updateConfig(config);

  save_config(config);
}

/**
 * A simple `react` hook to get access to `sdk`
 * with realtime reports about `auth`
 * 
 * 
 * @param {import("@storecraft/sdk").StorecraftSDKConfig} [config]
 * 
 */
export const useStorecraft = (config=getLatestConfig()) => {

  const [error, setError] = useState(undefined);
  const trigger = useTrigger();
  const isAuthenticated = sdk.auth.isAuthenticated;

  const updateConfig = useCallback(
    /**
     * @param {import("@storecraft/sdk").StorecraftSDKConfig} config 
     */
    (config) => {
      internal_updateConfig(config);
      
      trigger();
    }, [trigger]
  );

  useEffect(
    () => {
      updateConfig(config);
    }, [config]
  );


  useEffect(
    () => {
      const unsub = sdk.auth.add_sub(
        ({ auth }) => {
          updateConfig(
            {
              ...sdk.config,
              auth
            }
          );
        }
      );

      sdk.auth.reAuthenticateIfNeeded();

      return unsub;

    }, []
  );

  return {
    config: sdk.config ?? getLatestConfig(),
    sdk, 
    isAuthenticated, 
    error,
    actions: {
      updateConfig, trigger
    }
  }
}
