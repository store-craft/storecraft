/**
 * 
 * @param {string} email 
 */
export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
}

/**
 * @param {string} v 
 */
export const tokens = (v) => {
  return (v?.split(' ').map(s => s.trim()).filter(Boolean)) ?? [];
}

/**
 * @template [Value=string] 
 * @typedef {object} Choice Taken from the inquirer lib, because it was private
 * @prop {Value} value
 * @prop {string} [name]
 * @prop {string} [description]
 * @prop {string} [short]
 * @prop {boolean | string} [disabled]
 * @prop {never} [type]
 */
