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
 * @param {Object} actual 
 * @param {Object} expected 
 */
export const assert_partial = (actual, expected) => {
  assert.equal(filter_actual_keys_by_expected(actual, expected), expected);
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
