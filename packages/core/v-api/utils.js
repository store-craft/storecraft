import { id } from '../utils/object-id.js';

/**
 * Create a UUID v4, stripped and with prefix
 * @param {string} prefix 
 * @returns 
 */
export const ID = (prefix='') => {
  prefix = prefix ? (prefix + '_') : prefix;
  return prefix + id();
}