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
 * @template T
 * @param {T} o 
 * @return {import("./utils.types.js").ReplaceValuesOfKeys<T, 'active' | 'confirmed_mail', boolean>}
 */
export const sanitize = o => {
  for (const key in o) {
    const value = o[key];

    if(!isDef(value)) {
      delete o[key];
      continue;
    }
    if(key==='active') {
      // @ts-ignore
      o[key] = Boolean(value);
    }
    else if(key==='confirmed_mail') {
      // @ts-ignore
      o[key] = Boolean(value);
    }
    else if(key==='price') {
      // @ts-ignore
      o[key] = parseFloat(value);
    }
    else if(key==='compare_at_price') {
      // @ts-ignore
      o[key] = parseFloat(value);
    }
    else if(typeof value === 'object') {
      sanitize(o[key])
    }
  }

  // @ts-ignore
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
  const xx = []
  for(const p of arr) {
    xx.push(sanitize(p));
  }
  return xx;
}

/**
 * 
 * @param {string} v 
 */
export const isID = v => {
  return v.includes('_');
}