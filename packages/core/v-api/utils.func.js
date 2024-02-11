import { id } from '../v-utils/object-id.js';

/**
 * Create an ID with prefix
 * @param {string} prefix 
 * @returns 
 */
export const ID = (prefix='') => {
  prefix = prefix ? (prefix + '_') : prefix;
  return prefix + id();
}

/**
 * 
 * @param {any | boolean} c 
 * @param {string} message 
 * @param {number} code 
 */
export const assert = (c, message, code=400) => {
  if(!Boolean(c)) {
    throw {
      message,
      code
    };
  };
}

/**
 * @template T
 * @param {T} d 
 * @returns {T & { created_at: string, updated_at: string}} d 
 */
export const apply_dates = d => {
  const now_iso = new Date().toISOString();
  d.created_at = d.created_at ?? now_iso;
  d.updated_at = now_iso;
  return d;
}

export const select_fields = (...fields) => o => fields.reduce((p, c) =>  ({ ...p, [c] : o[c] }), {});
export const filter_fields = (...fields) => items => items.map(item => select_fields(...fields)(item));


export const select_unused_fields = o => Object.keys(o).reduce((p, c) =>  { 
  if(Array.isArray(o[c])) {
    if(o[c].length) p[c]=o[c]
  }
  else if(typeof o[c]!=='undefined')
    p[c]=o[c]      
  return p 
}, {});

export const filter_unused = items => items.map(item => select_unused_fields(item));

/**
 * 
 * @param  {...string} keys 
 * @param  {object} o 
 * @returns 
 */
export const delete_keys = (...keys) => o => {
  o = Array.isArray(o) ? o : [o];
  o.forEach(it => keys.forEach(k => delete it[k] ));
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
];

/**
 * 
 * @param {string} text 
 * @returns {string[] | undefined}
 */
export const to_tokens = (text) => {
  if(typeof text !== 'string')
    return [];

  // match can return null
  let tokens = text?.toString().toLowerCase().match(/[\p{L}\d]+/gu) ?? [];

  tokens = tokens.filter(
    t => !STOP_WORDS.includes(t)
  );

  return tokens;
}

/**
 * @param  {...any} args 
 */
export const union = (...args) => [
  ...new Set(args.flat(Infinity))
].filter(a => a!==undefined && a!==null);

export const isEmpty = (str) => (!str?.trim().length);

/**
 * URL friendly handle
 * @param {string} title 
 * @returns {string | undefined}
 */
export const to_handle = (title, delimiter='-') => {
  if(typeof title !== 'string')
    return undefined
  let trimmed = title.trim()
  if(trimmed === "")
    return undefined
  
  trimmed = trimmed.toLowerCase().match(/[\p{L}\d]+/gu).join(delimiter)
  if(trimmed.length==0)
      return undefined
  
  return trimmed
}
