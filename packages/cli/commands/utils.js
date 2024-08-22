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