/**
 * Valid number with source alphabet
 *
 * @param {ArrayLike} number
 *
 * @returns {boolean}
 */
const isValid = function (number, srcAlphabet) {
  var i = 0;
  for (; i < number.length; ++i) {
    if (srcAlphabet.indexOf(number[i]) === -1) {
      return false;
    }
  }
  return true;
};

/**
 * Convert number from source alphabet to destination alphabet
 *
 * @param {string|Array} srcAlphabet - from alphabet
 * @param {string|Array} dstAlphabet - to alphabet
 * @param {string|Array} number - number represented as a string or array of points
 *
 * @returns {string|Array}
 */
export const convert = function (number, srcAlphabet, dstAlphabet) {
  var i, divide=0, newlen,
    numberMap = {},
    fromBase = srcAlphabet.length,
    toBase = dstAlphabet.length,
    length = number.length,
    /** @type {string | string[]} */
    result = typeof number === 'string' ? '' : [];

  if (!isValid(number, srcAlphabet)) {
    throw new Error(
      'Number "' + number + '" contains of non-alphabetic digits (' + srcAlphabet + ')'
      );
  }

  if (srcAlphabet === dstAlphabet) {
    return number;
  }

  for (i = 0; i < length; i++) {
    numberMap[i] = srcAlphabet.indexOf(number[i]);
  };

  do {
    divide = 0;
    newlen = 0;
    for (i = 0; i < length; i++) {
      divide = divide * fromBase + numberMap[i];
      if (divide >= toBase) {
        numberMap[newlen++] = parseInt(String(divide / toBase), 10);
        divide = divide % toBase;
      } else if (newlen > 0) {
        numberMap[newlen++] = 0;
      }
    }
    length = newlen;
    // @ts-ignore
    result = dstAlphabet.slice(divide, divide + 1).concat(result);
  } while (newlen !== 0);

  return result;
};

export const BIN = '01';
export const OCT = '01234567';
export const DEC = '0123456789';
export const HEX = '0123456789abcdef';
export const flickrBase58 = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
export const cookieBase90 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'()*+-./:<=>?@[]^_`{|}~";

export const uuid = () => {
  const u = crypto.randomUUID();
  console.log(u.length)
  return u;
}

export const short_uuid = () => {
  return convert(uuid().replace(/-/g, ''), HEX, flickrBase58)
}
