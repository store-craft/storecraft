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

/**
 * 
 * @param {any} c 
 * @param {string} message 
 * @param {number} code 
 */
export const assert = (c, message, code=400) => {
  if(!Boolean(c)) {
    throw {
      message,
      code
    };
  };
}

/**
 * url friendly handle
 * @param {string} title 
 * @returns 
 */
export const to_handle = (title) => {
  return title?.toLowerCase().match(/[\p{L}\d]+/gu)?.join('-')
}

/**
 * @template {import('../types.api.js').BaseType} T
 * @param {T} d 
 */
export const apply_dates = d => {
  const now_iso = new Date().toISOString();
  d.created_at = d.created_at ?? now_iso;
  d.updated_at = now_iso;
  return d;
}