import { 
  create_local_storage_hook 
} from './use-local-storage'

/**
 * 
 * @typedef {object} ChatPreferences
 * @prop {boolean} [darkMode]
 * 
 */


/** @type {ChatPreferences} */
const default_value = {
  darkMode: true
}

const KEY = 'storecraft_chat_preferences';

export const usePreferences = create_local_storage_hook(
  KEY, default_value
);

