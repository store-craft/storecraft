import { useCallback, useEffect, useState } from "react";
import useTrigger from "./useTrigger.js";
import { create } from "@storecraft/sdk";
import { LS } from "./utils.browser.js";

const CONFIG_KEY = `storecraft_latest_config`;

/**
 * 
 * @returns {import("@storecraft/sdk").StorecraftConfig}
 */
export const getLatestConfig = () => {
  return sdk?.config ?? LS.get(CONFIG_KEY);
}

var sdk = create(getLatestConfig());

/**
 * 
 * @param {import("@storecraft/sdk").StorecraftConfig} [config]
 */
const save_config = (config={}) => {
  LS.set(CONFIG_KEY, config);
}



/**
 * @param {import("@storecraft/sdk").StorecraftConfig} config 
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
 * @param {import("@storecraft/sdk").StorecraftConfig} [config]
 * 
 */
export const useStorecraft = (config=getLatestConfig()) => {

  const [error, setError] = useState(undefined);
  const trigger = useTrigger();
  const isAuthenticated = sdk.auth.isAuthenticated;

  const updateConfig = useCallback(
    /**
     * @param {import("@storecraft/sdk").StorecraftConfig} config 
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
        ([user, isAuth]) => {
          updateConfig(
            {
              ...sdk.config,
              auth: user
            }
          );
        }
      );

      // sdk.auth.reAuthenticate();

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
