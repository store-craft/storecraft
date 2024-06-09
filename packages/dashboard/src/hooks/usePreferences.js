import { 
  create_local_storage_hook 
} from '@storecraft/sdk-react-hooks'

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

export const usePreferences = create_local_storage_hook(
  KEY, default_value
);

