import { id } from '../crypto/object-id.js';
 
export class StorecraftError extends Error {
  #message_string;
  /**
   * @param {any} message 
   * @param {number} code 
   */
  constructor(message, code=400) {
    super();

    this.code = code;
    this.message = message;
    try {
      this.#message_string = JSON.stringify(
        this.message, null, 2
      );
    } catch (e) {
      this.#message_string = ':('
    }

    if(
      (typeof this.message!== 'string') &&
      (
        this.message!==undefined || 
        this.message!==null
      )
    ) {
      this.message.toString = () => this.#message_string;
    }
    
    // console.log(JSON.stringify(message, null, 2));
  }

  toString() {
    return this.#message_string;
  }
}

/**
 * @description Create an ID with prefix
 * @param {string} prefix 
 */
export const ID = (prefix='') => {
  prefix = prefix ? (prefix + '_') : prefix;
  return prefix + id();
}

/**
 * @param {any | boolean} c 
 * @param {any} message 
 * @param {number} code 
 */
export const assert = (c, message, code=400) => {
  if(!Boolean(c)) {

    throw new StorecraftError(
      [{message}], code
    );
  };
}

/**
 * @description Assert a condition and throw an error if not met asynchronously.
 * @param {any | boolean} c 
 * @param {any} message 
 * @param {number} code 
 */
export const assert_async = async (c, message, code=400) => {
  if(!Boolean(c)) {
    if(typeof message === 'function') {
      message = await message();
    }

    throw new StorecraftError(
      [{message}], code
    );
  };
}


export const parse_json_safely = (v='') => {
  try {
    return JSON.parse(v);
  } catch (e) {
    return undefined;
  }
}

/**
 * @description Remove all undefined and null values from object
 * @template {any} T
 * @param {T & Partial<{ created_at: string, updated_at: string}>} d 
 * @returns {T & { created_at: string, updated_at: string}} 
 */
export const apply_dates = d => {
  const now_iso = new Date().toISOString();
  d.created_at = new Date(d.created_at ?? now_iso).toISOString();
  d.updated_at = now_iso;
  // casting
  const c = /** @type {T & { created_at: string, updated_at: string}} */(d);
  return c;
}


/**
 * @description Select specific fields from an object
 * @param  {...any} fields 
 */
export const select_fields = (...fields) => {
  /**
   * @param {Record<string, any>} o
   */
  return o => fields.reduce((p, c) =>  ({ ...p, [c] : o[c] }), {});
}

/**
 * @description Filter specific fields from an object
 * @param  {...any} fields 
 * @returns 
 */
export const filter_fields = (...fields) => {
  /**
   * @param {any[]} items
   */
  return items => items.map(item => select_fields(...fields)(item));
}


/**
 * @description Delete specific keys from an object
 * @param  {...string} keys 
 */
export const delete_keys = (...keys) => {
  /**
   * @param  {object} o 
   */
  return o => {
    o = Array.isArray(o) ? o : [o];
    o.forEach(it => keys.forEach(k => delete it[k] ));
    return o
  }
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
 * @description Convert text to tokens
 * @param {string} text 
 * @returns {string[] | undefined}
 */
export const to_tokens = (text) => {
  if(typeof text !== 'string')
    return [];

  // match can return null
  let tokens = text?.toString().toLowerCase().match(/[\p{L}\d]+/gu) ?? [];

  return tokens.filter(
    t => !STOP_WORDS.includes(t)
  );
}

/**
 * @description union of arrays
 * @param  {...any} args 
 * @returns {string[]}
 */
export const union = (...args) => [...new Set(args.flat(Infinity))].filter(Boolean).map(x => String(x));

export const isEmpty = (str) => (!str?.trim().length);

/**
 * @description URL friendly handle
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
