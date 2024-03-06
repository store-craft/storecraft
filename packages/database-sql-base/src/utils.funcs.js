import { ObjectId } from 'mongodb';

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
 * Sanitize hidden properties in-place
 * @template {object} T
 * @param {T} o 
 * @return {Omit<T, '_id' | '_relations'>}
 */
export const sanitize_hidden = o => {
  if(!isDef(o))
    return o;

  for (const k of Object.keys(o)) {
    if(k.startsWith('_'))
      delete o[k];
  }
  return o;
}

/**
 * Sanitize null/undefined valued keys
 * @template {object} T
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
 * @param {string} id 
 * @returns 
 */
export const to_objid = id => new ObjectId(id.split('_').at(-1))

/**
 * 
 * @param {string} handle_or_id 
 * @returns { {_id:ObjectId} | {handle: string}}
 */
export const handle_or_id = (handle_or_id) => {
  let r = {};
  try {
    r._id = to_objid(handle_or_id);
  } catch (e) {
    r.handle = handle_or_id;
  }
  return r;
}

/**
 * 
 * @param {string} v 
 */
export const isID = v => {
  return v.includes('_');
}