import { mountStorecraftDashboard } from '.'

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