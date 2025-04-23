/**
 */

import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * timestamp to iso
 * 
 * 
 * @param {number} number 
 */
export const iso = number => {
  return new Date(number).toISOString();
}

/**
 * @param {string | URL} meta_url 
 */
export const file_name = (meta_url) => {
  return basename(
    dirname(fileURLToPath(meta_url))
  ) + '/' + 
  basename(fileURLToPath(meta_url));
}
