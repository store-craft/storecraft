export const isDef = v => v!==undefined && v!==null;
export const isUndef = v => !isDef(v);

/**
 * 
 * @param  {...any} keys 
 * @returns 
 */
export const delete_keys = (...keys) => {

  /**
   * @template T
   * @param {T} o
   * @returns {T}
   */
  return (o) => {
    keys.forEach(k => {o?.[k] && delete o[k]} )
    return o
  }
}

/**
 * Sanitize null/undefined valued keys
 * @template {Record<string, any>} T
 * @param {T} o 
 */
export const sanitize = o => {
  for (const key in o) {
    if(key.startsWith('_') || (!isDef(o[key]) && o.hasOwnProperty(key))) {
      delete o[key];
      continue;
    }
    if(key==='active') {
      o[key] = Boolean(o[key]);
    }

    if(Array.isArray(o[key])) {
      sanitize_array(o[key]);
    }

  }
  return o;
}


/**
 * Sanitize the mongo document before sending to client
 * @template T
 * @param {T[]} arr 
 */
export const sanitize_array = arr => {
  for(const p of arr) {
    sanitize(p);
  }
  return arr;
}

/**
 * 
 * @param {string} v 
 */
export const isID = v => {
  return v.includes('_');
}