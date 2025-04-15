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

export const withRandom = (o='', length=10) => o + '-' + generateRandomString(length)

/**
 * 
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
 * @description given two objects `actual` and `expected`, perform deep equal test
 * between expected and it's mutual keys with actual
 * 
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
 * @description given two objects `actual` and `expected`, perform deep equal test
 * between expected and it's mutual keys with actual
 * 
 */
export const assert_partial_minus_relations = () => {
  return assert_partial_with_ignored_keys(
    'search', 'products', 'discounts', 'posts', 'collections'
  )
}

/**
 * @description given two objects `actual` and `expected`, perform deep equal test
 * between expected and it's mutual keys with actual
 * 
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
export const assert_async_throws = async (fn, message='function should have thrown !!!') => {
  try {
    await fn();
  } catch (e) {
    console.log('throwing function ', e.message)
    return;
  }

  assert.unreachable(message);
}
