import { useCallback } from 'react'
import { usePreferences } from './usePreferences.js';


/**
 * 
 * The `dark-mode` state hook
 * 
 */
export default function useDarkMode() {
  const { state, setState } = usePreferences();

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