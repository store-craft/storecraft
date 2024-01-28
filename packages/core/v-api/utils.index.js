import { to_tokens } from './utils.func.js';

export const isUnd = v => v===undefined;
export const isDef = v => v!==undefined;

/**
 * Reasonable search index for terms for most types
 * @param {import('../types.api.js').BaseType} data 
 * @returns {string[]}
 */
export const create_search_index = (data) => {
  let s = [];
  s.push(...(data?.tags ?? []).map(t => `tag:${t}`));
  isDef(data.handle) && s.push(`handle:${data.handle}`);
  isDef(data.active) && s.push(`active:${Boolean(data.active)}`);
  isDef(data.title) && s.push(...to_tokens(data.title), data.title.toLowerCase().trim());
  isDef(data.desc) && s.push(...to_tokens(data.desc));

  return s;
}