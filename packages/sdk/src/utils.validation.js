/**
 * @param {string} value 
 */
export const isEmailValid = (value) => {
  return /\S+@\S+\.\S+/.test(value);
}

/**
 * 
 * @param {number} v 
 * @param {number} min 
 * @param {number} max 
 */
export const isNumberValid = (
  v, min=Number.NEGATIVE_INFINITY, max=Number.POSITIVE_INFINITY
  ) => {
  return (typeof v === 'number') && (v >= min) && (v <= max);
}
  