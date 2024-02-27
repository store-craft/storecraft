import { to_tokens } from './utils.func.js';

export const isDef = v => v!==undefined && v!==null;
export const isUnd = v => !isDef(v);

/**
 * Reasonable search index for terms for most types
 * @param {import('./types.api.js').BaseType} data 
 * @returns {string[]}
 */
export const create_search_index = (data) => {
  let s = [];
  s.push(...(data?.tags ?? []).map(t => `tag:${t}`));
  isDef(data.handle) && s.push(`handle:${data.handle}`, data.handle);
  isDef(data.id) && s.push(`id:${data.id}`, data.id, data.id.split('_').at(-1));
  isDef(data.active) && s.push(`active:${Boolean(data.active)}`);
  isDef(data.title) && s.push(...to_tokens(data.title), data.title.toLowerCase().trim());
  isDef(data.name) && s.push(...to_tokens(data.name), data.name.toLowerCase().trim());
  // isDef(data.desc) && s.push(...to_tokens(data.desc));
  isDef(data._published) && s.push(`published:${Boolean(data?._published)}`);

  return s;
}