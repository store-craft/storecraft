import { useCallback } from 'react'
import { create_local_storage_hook } from './use-local-storage.js';

const usePreference = create_local_storage_hook(
  'chat_dark_mode',
  true
);

/**
 * 
 * The `dark-mode` state hook
 * 
 */
export default function useDarkMode() {
  const { state, setState } = usePreference();

  const toggle = useCallback(
    () => {
      setState(
        x => !x
      )
    }, []
  );

  return { 
    darkMode: state, 
    toggle 
  }
}