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
 * 
 * 
 * @template {Record<string, any>} T
 * 
 * 
 * @param {T} o 
 */
export const sanitize = o => {
  for (const key in o) {
    const value = o[key];

    if(!isDef(value)) {
      delete o[key];
      continue;
    }
    if(key==='active') {
      o[key] = Boolean(value);
    }
    else if(key==='price') {
      o[key] = parseFloat(value);
    }
    else if(key==='compare_at_price') {
      o[key] = parseFloat(value);
    }
    else if(typeof value === 'object') {
      sanitize(o[key])
    }
  }

  return o;
}


/**
 * Sanitize the document before sending to client
 * 
 * @template T
 * 
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