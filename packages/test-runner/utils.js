import * as assert from 'uvu/assert';

const filter_actual_keys_by_expected = (actual, expected) => {
  return Object.keys(expected).reduce(
    (p, c) => {
      p[c] = actual[c];
      return p;
    }, {}
  )
}

/**
 * given two objects `actual` and `expected`, perform deep equal test
 * between expected and it's mutual keys with actual
 * @param {Object | Object[]} actual 
 * @param {Object | Object[]} expected 
 * @param {string} prefix 
 */
export const assert_partial = (actual, expected, prefix='', _original=undefined) => {
  // console.log('actual ', actual)
  // console.log('expected ', expected)
  _original = _original ?? {actual, expected};
  if(Array.isArray(actual) && Array.isArray(expected)) {
    assert.ok(
      actual.length==expected.length, 
      'assert_partial:: actual is not same shape as expected !!!'
    );
    for(let ix=0; ix < expected.length; ix++) {
      assert_partial(actual?.[ix], expected[ix], `${prefix}[${ix}]`, _original);
    }
  } else if(typeof expected === 'object') {
    for(const k of Object.keys(expected)) {
      // console.log(k, expected[k])
      assert_partial(actual?.[k], expected[k], `${prefix}[${k}]`, _original);
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

export const assert_async_throws = async (fn) => {
  try {
    await fn();
  } catch (e) {
    // console.log('throwing function ', e.message)
    return;
  }

  assert.ok(false, 'function should have thrown !!!')
}
