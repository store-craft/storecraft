import { assert } from "./common/utils/functional.js"

/**
 * 
 * @param {import("./index.js").StorecraftConfig} config 
 * @param {string} path 
 */
export const url = (config, path) => {
  let base = config?.endpoint
  assert(base, 'No Endpoint !');

  base = base.endsWith('/') ? base.slice(0, -1) : base;
  path = path.startsWith('/') ? path.slice(1) : path;

  return `${base}/${path}`;
}
