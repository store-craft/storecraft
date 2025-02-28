import { to_tokens } from './utils.func.js';

/**
 * Is the value **NOT** (`undefined` **OR** `null`) ?
 * @param {any} v 
 * @returns {boolean}
 */
export const isDef = v => !(v===undefined || v===null);

/**
 * Is the value (`undefined` **OR** `null`) ?
 * @param {any} v 
 * @returns {boolean}
 */
export const isUnd = v => !isDef(v);

/**
 * Reasonable search index for terms for most types
 * @param {Partial<import('./types.api.d.ts').BaseType>} data 
 * @returns {string[]}
 */
export const create_search_index = (data) => {
  
  let s = /** @type {string[]} */([]);

  s.push(
    ...(data?.tags ?? []).map(t => `tag:${t}`)
  );

  if(
    ('handle' in data) &&
    isDef(data.handle) &&
    (typeof data.handle === 'string')
  ) {
     s.push(`handle:${data.handle}`, data.handle);
  } 

  if(isDef(data.id)) {
    s.push(
      `id:${data.id}`, data.id, data.id.split('_').at(-1)
    );
  }

  if(isDef(data.active)) {
    s.push(`active:${Boolean(data.active)}`);
  }

  if(
    ('title' in data) && 
    (isDef(data.title)) &&
    (typeof data.title === 'string')
  ) {
    s.push(
      ...to_tokens(data.title), 
      data.title.toLowerCase().trim()
    );
  }

  if(
    ('name' in data) && 
    isDef(data.name) &&
    (typeof data.name === 'string')
  ) {
    s.push(
      ...to_tokens(data.name), 
      data.name.toLowerCase().trim()
    );
  }

  if(
    ('published' in data) && 
    isDef(data.published)
  ) {
    s.push(`published:${Boolean(data?.published)}`);

  }

  // isDef(data.desc) && s.push(...to_tokens(data.desc));

  return s;
}