/**
 */
import { to_handle } from '../../api/utils.func.js';
export { file_name } from './api.utils.file.js'

/**
 * @description timestamp to `iso`
 * @param {number} number 
 */
export const iso = (number) => {
  return new Date(number).toISOString();
}

/**
 * @description Execute a bunch of functions, 
 * that create promises sequentially. All tests 
 * promises run in serial to avoid transactions locks.
 * @template T
 * @param {(() => Promise<T>)[]} items 
 */
export const promises_sequence = async (items) => {
  const results = [];
  for(const it of items)
    results.push(await it())
  return results;
}

/**
 * @description A generator function to create a `handle`
 * iteratively over prefixes and a moving index.
 * @param  {...string} prefixs 
 */
export const create_handle = (...prefixs) => {
  let index = 0;
  return () => {
    return to_handle([...prefixs, index+=1].join('-'));
  }
}

/**
 * @description A generator function to create a title
 * iteratively over prefixes and a moving index.
 * @param  {...string} prefixs 
 */
export const create_title_gen = (...prefixs) => {
  let index = 0;
  return () => {
    return [...prefixs, index+=1].join(' ');
  }
}


/**
 * @description a list of 10 static ids, this is 
 * helpful for testing
 * @param {string} prefix 
 */
export const get_static_ids = (prefix) => {
  return [
    '65e5ca42c43e2c41ae5216a9',
    '65e5ca42c43e2c41ae5216aa',
    '65e5ca42c43e2c41ae5216ab',
    '65e5ca42c43e2c41ae5216ac',
    '65e5ca42c43e2c41ae5216ad',
    '65e5ca42c43e2c41ae5216ae',
    '65e5ca42c43e2c41ae5216af',
    '65e5ca42c43e2c41ae5216b0',
    '65e5ca42c43e2c41ae5216b1',
    '65e5ca42c43e2c41ae5216b2'
  ].map(id => `${prefix}_${id}`);
}

/**
 * @description Pick a random item from an array
 * @template T
 * @param {T[]} items 
 */
export const pick_random = (items) => {
  const idx = Math.floor(Math.random() * (items.length - 1));
  return items.at(idx);
}

import * as assert from 'uvu/assert';

export function sleep(ms=1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const withTimestamp = (o='') => `${o}-${Date.now()}`;
// Function to generate a random 5-character string
const generateRandomString = (length=10) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
  }
  return result;
}

/**
 * @description Generate a random string with a prefix
 * @param {string} o 
 * @param {number} length 
 */
export const withRandom = (o='', length=10) => 
  o + '-' + generateRandomString(length);

/**
 * @description Delete keys from an object
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


const filter_actual_keys_by_expected = (actual, expected) => {
  return Object.keys(expected).reduce(
    (p, c) => {
      p[c] = actual[c];
      return p;
    }, {}
  )
}

/**
 * @description given two objects `actual` and `expected`, 
 * perform deep equal test between expected and it's 
 * mutual keys with actual
 * @param {...string} keys 
 */
export const assert_partial_with_ignored_keys = (...keys) => {

  /**
   * given two objects `actual` and `expected`, perform deep equal test
   * between expected and it's mutual keys with actual
   * 
   * @param {Object | Object[]} actual 
   * @param {Object | Object[]} expected 
   * @param {string} prefix 
   */
  return (actual, expected, prefix='', _original=undefined) => {
    // console.log('actual ', actual)
    // console.log('expected ', expected)
    _original = _original ?? {actual, expected};

    if(Array.isArray(actual) && Array.isArray(expected)) {
      assert.ok(
        actual.length==expected.length, 
        `assert_partial:: actual ${prefix} is not same shape as expected !!!\n` + 
        `actual${prefix}=${JSON.stringify(actual, null, 2)}\n` + 
        `expected${prefix}=${JSON.stringify(expected, null, 2)}\n`
      );
      for(let ix=0; ix < expected.length; ix++) {
        assert_partial_with_ignored_keys(...keys)(
          actual?.[ix], expected[ix], `${prefix}[${ix}]`, _original
        );
      }
    } else if(typeof expected === 'object') {
      for(const k of Object.keys(expected).filter(x => !keys.includes(x))) {
        // console.log(k, expected[k])
        assert_partial_with_ignored_keys(...keys)(
          actual?.[k], expected[k], `${prefix}[${k}]`, _original
        );
      }
      // assert.equal(filter_actual_keys_by_expected(actual, expected), expected);
    } else {
      // console.log(actual, expected)
      if(expected!==actual) {
        const msg = '\n' + `expected${prefix}=${expected}` +'\n' +
          `actual${prefix}=${actual}`;
        // just for the nice diff view
        assert.equal(_original.actual, _original.expected, msg);
      }
    }
  }
}


/**
 * @description given two objects `actual` and `expected`, 
 * perform deep equal test between expected and it's mutual 
 * keys with actual
 */
export const assert_partial_minus_relations = () => {
  return assert_partial_with_ignored_keys(
    'search', 'products', 'discounts', 'posts', 'collections'
  )
}

/**
 * @description given two objects `actual` and `expected`, 
 * perform deep equal test between expected and it's mutual 
 * keys with actual
 * @param {Object | Object[]} actual 
 * @param {Object | Object[]} expected 
 * @param {string} prefix 
 * @param {string} [prefix_msg=''] prefix message before actual error message
 */
export const assert_partial = (
  actual, expected, prefix='', _original=undefined, prefix_msg=''
) => {
  _original = _original ?? {actual, expected};
  if(typeof expected === 'object') {
    if(Array.isArray(expected)) {
      assert.ok(
        Array.isArray(actual),
        `${prefix_msg} \nexpected array but got typeof ${prefix} = ${typeof actual}`
      )
    }

    for(const k of Object.keys(expected)) {
      assert_partial(actual?.[k], expected[k], `${prefix}[${k}]`, _original, prefix_msg);
    }
  } else {
    if(expected!==actual) {
      const msg = '\n' + prefix_msg + '\n' + `expected${prefix}=${expected}` +'\n' +
        `actual${prefix}=${actual}`;
      // just for the nice diff view of `uvu`
      // console.log({_original, actual, expected})
      assert.equal(actual, expected, msg);
      // assert.equal(_original?.actual, _original?.expected, msg);
    }
  }
}

/**
 * 
 * @param {object} actual 
 * @param {object} expected 
 * @param {string} [msg] 
 */
export const assert_partial_v2 = (actual, expected, msg='') => {
  assert_partial(actual, expected, '', undefined, msg);
}

/**
 * 
 * @param {() => Promise<any>} fn 
 */
export const assert_async_throws = async (
  fn, message='function should have thrown !!!'
) => {
  try {
    await fn();
  } catch (e) {
    // console.log('throwing function ', e.message)
    return;
  }

  assert.unreachable(message);
}


/**
 * @param {ReadableStream} stream 
 */
export const stream_to_string = async (stream) => {
  let text = '';
  const decoder = new TextDecoder();
  for await (const part of stream) {
    text += decoder.decode(part);
  }
  return text;
}