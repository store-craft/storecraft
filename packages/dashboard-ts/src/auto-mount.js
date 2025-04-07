import { mountStorecraftDashboard } from './index.jsx'

/**
 * @description Automatically `mount` the dashboard at a
 * <div id="root" /> element. Includes configurable 
 * `backend-endpoint`
 * 
 */
mountStorecraftDashboard(
  document.getElementById('root'),
  true
);