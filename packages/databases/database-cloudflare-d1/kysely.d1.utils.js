
/**
 * @description Just for education and debugging, do not use !!!
 * @param {string} stmt 
 * @param {any[] | Record<string, any>} params 
 */
export const prepare_and_bind = (stmt='', params=[]) => {
  const params_object = Array.isArray(params) ? 
      params.reduce((a, v, idx) => ({ ...a, [idx+1]: v}), {}) : 
      params; 

  let current = 0;
  let result = ''
  let index_run = 1;
  for (let m of stmt.matchAll(/\?[0-9]*/g)) {
    result += stmt.slice(current, m.index);
  
    const match_string = m[0];
    let index_access = match_string.length > 1 ? 
          Number(match_string.slice(1)) : 
          index_run;
  
    result += "'" + params_object[index_access] + "'";
  
    current = m.index + m[0].length;
    index_run+=1;
  }
  
  result += stmt.slice(current);

  return result;
}

