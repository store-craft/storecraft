
/**
 * @template T
 * @param  {...string} keys 
 * @returns 
 */

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
 * @template T
 * @param {T} o 
 * @returns {T}
 */
export const delete_id = o => {
  return delete_keys('_id')(o)
}