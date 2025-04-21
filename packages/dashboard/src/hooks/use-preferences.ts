import { 
  create_local_storage_hook 
} from '@storecraft/sdk-react-hooks'

export type StorecraftDashboardPreferences = {
  darkMode?: boolean
}


const default_value: StorecraftDashboardPreferences = {
  darkMode: true
}

const KEY = 'storecraft_dashboard_preferences';

export const usePreferences = create_local_storage_hook(
  KEY, default_value
);

