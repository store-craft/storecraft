

export const select_fields = (...fields) => o => fields.reduce((p, c) =>  ({ ...p, [c] : o[c] }), {})
export const filter_fields = (...fields) => items => items.map(item => select_fields(...fields)(item))


export const select_unused_fields = o => Object.keys(o).reduce((p, c) =>  { 
  if(Array.isArray(o[c])) {
    if(o[c].length) p[c]=o[c]
  }
  else if(typeof o[c]!=='undefined')
    p[c]=o[c]      
  return p 
}, {})
export const filter_unused = items => items.map(item => select_unused_fields(item))

/**
 * 
 * @param  {...string} keys 
 * @param  {object} o 
 * @returns 
 */
export const delete_keys = (...keys) => o => {
  o = Array.isArray(o) ? o : [o]
  o.forEach(it => keys.forEach(k => delete it[k] ))
  return o
}

export const text2tokens_unsafe = (text) => {
  return text?.toString().toLowerCase().match(/\S+/g)
}

export const STOP_WORDS = [
  'i','me','my','myself','we','our','ours','ourselves','you',
  'your','yours','yourself','yourselves','he','him','his','himself',
  'she','her','hers','herself','it','its','itself','they','them',
  'their','theirs','themselves','what','which','who','whom','this',
  'that','these','those','am','is','are','was','were','be','been',
  'being','have','has','had','having','do','does','did','doing','a',
  'an','the','and','but','if','or','because','as','until','while',
  'of','at','by','for','with','about','against','between','into',
  'through','during','before','after','above','below','to','from','up',
  'down','in','out','on','off','over','under','again','further','then','once',
  'here','there','when','where','why','how','all','any','both','each','few',
  'more','most','other','some','such','no','nor','not','only','own','same',
  'so','than','too','very','s','t','can','will','just','don','should','now'
]

/**
 * 
 * @param {string} text 
 * @param {boolean} undefined_on_empty 
 * @returns {string[] | undefined}
 */
export const text2tokens = (text) => {
  // match can return undefined
  // let tokens = text?.toString().toLowerCase().match(/\S+/g)
  // let tokens = text?.toString().toLowerCase().match(/[^\W_]+/g)
  let tokens = text?.toString().toLowerCase().match(/[\p{L}\d]+/gu)

  tokens = tokens ?? []
  tokens = tokens.filter(
    t => !STOP_WORDS.includes(t)
  )

  return tokens
}
// /[\p{L}\d]+/gu
export const union_array = (arrA=[], arrB=[]) => [...new Set([...arrA, ...arrB])];

export const isEmpty = (str) => (!str?.trim().length)

export const to_handle = (title) => {
  if(typeof title !== 'string')
    return undefined
  let trimmed = title.trim()
  if(trimmed === "")
    return undefined
  
  // trimmed = trimmed.toLowerCase().replace(/[\W_]+/g, ' ')
  // .trim().split(' ').join('-')

  trimmed = trimmed.toLowerCase().match(/[\p{L}\d]+/gu).join('-')
  if(trimmed.length==0)
      return undefined
  
  return trimmed
  // return trimmed.toLowerCase().replace(/[\W_]+/g, '-')
}


export const assert = (condition, msg) => {
  if(!Boolean(condition))
    throw msg
}