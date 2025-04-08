import { mountStorecraftDashboard } from './index.js'

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