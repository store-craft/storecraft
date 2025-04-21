
export const q2o = (q, base) => {
  let obj2 = {}
  try {
    obj2 = JSON.parse(
      '{"' + q?.replace(/&/g, '","')
              .replace(/=/g,'":"') + '"}', 
              (key, value) => { 
                  return key===""?value:decodeURIComponent(value) 
              }
          )
  } catch (e) {

  } 

  return { ...base, ...obj2 }
}

export const o2q = o => {
  return Object.entries(o)
               .filter(
                ([k, v]) => v
               )
               .map(
                ([k, v]) => `${String(k)}=${encodeURIComponent(String(v))}`
                )
               .join('&')
}               