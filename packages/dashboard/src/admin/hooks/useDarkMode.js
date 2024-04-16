import { useCallback } from 'react'
import { create_local_storage_hook } from '@storecraft/sdk-react-hooks'

/**
 * 
 * @typedef {object} StorecraftDashboardPreferences
 * @prop {boolean} [darkMode]
 * 
 */


/** @type {StorecraftDashboardPreferences} */
const default_value = {
  darkMode: true
}

const KEY = 'storecraft_dashboard_preferences';

const useLocalStorage = create_local_storage_hook(KEY, default_value);


/**
 * @param {boolean} [defaultValue] 
 */
export default function useDarkMode(defaultValue=true) {
  const { state, setState } = useLocalStorage();

  const toggle = useCallback(
    () => {
      setState(
        {
          ...state,
          darkMode: !state.darkMode
        }
      )
    }, [state]
  );

  return { 
    darkMode: state.darkMode, 
    toggle 
  }
}