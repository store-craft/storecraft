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
  return LS.get(CONFIG_KEY)
}


/**
 * 
 * @param {import("@storecraft/sdk").StorecraftConfig} [config]
 */
const save_config = (config={}) => {
  LS.set(CONFIG_KEY, config);
}


const sdk = create(getLatestConfig());


/**
 * A simple `react` hook to get access to `sdk`
 * with realtime reports about `auth`
 * 
 */
export const useStorecraft = () => {

  const [error, setError] = useState(undefined);
  const trigger = useTrigger();
  const isAuthenticated = sdk.auth.isAuthenticated;

  const updateConfig = useCallback(
    /**
     * @param {import("@storecraft/sdk").StorecraftConfig} config 
     */
    (config) => {
      try {
        sdk.updateConfig(config);
        save_config(config);
      } catch(e) {
        setError(e);
      } finally {
        trigger();
      }
    }, [trigger]
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

    }, [updateConfig]
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
