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
export const parse_csv = (v) => {
  return (v?.split(/[\s\,]+/).map(s => s.trim()).filter(Boolean)) ?? [];
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
 * @prop {boolean} [ignore=false] ignore or filter
 */


export const o2s = (o, space=0) => {
  // console.log('got', o)
  let json = JSON.stringify(o, null, 0);
  // if(json.length > 80)
  //   json = json = JSON.stringify(o, null, 2);
  const unquoted = json.replace(/"([^"]+)":/g, '$1:');
  return unquoted;
}
