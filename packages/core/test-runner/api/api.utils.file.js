/**
 */
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string | URL} meta_url 
 */
export const file_name = (meta_url) => {
  return basename(
    dirname(fileURLToPath(meta_url))
  ) + '/' + 
  basename(fileURLToPath(meta_url));
}
