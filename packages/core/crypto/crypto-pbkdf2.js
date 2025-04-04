import { atob, btoa, decode, encode, encodeURI } from "./base64.js";

/**
 * Returns PBKDF2 derived key from supplied password.
 *
 * Stored key can subsequently be used to verify that a password matches the original password used
 * to derive the key, using pbkdf2Verify().
 * @url https://gist.github.com/chrisveness/770ee96945ec12ac84f134bf538d89fb#file-crypto-pbkdf2-js
 * @param   {string} password - Password to be hashed using key derivation function.
 * @param   {number} [iterations=1e6] - Number of iterations of HMAC function to apply.
 * @returns {Promise<string>} Derived key as base64 string.
 *
 * @example
 *   const key = await pbkdf2('pāşšŵōřđ'); // eg 'djAxBRKXWNWPyXgpKWHld8SWJA9CQFmLyMbNet7Rle5RLKJAkBCllLfM6tPFa7bAis0lSTiB'
 */
export async function hash(password, iterations=1e6) {
  iterations = Math.min(iterations, 100000);
  const pwUtf8 = new TextEncoder().encode(password);                                           // encode pw as UTF-8
  const pwKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveBits']); // create pw key
  const saltUint8 = crypto.getRandomValues(new Uint8Array(16));                                // get random salt
  const params = { name: 'PBKDF2', hash: 'SHA-256', salt: saltUint8, iterations: iterations }; // pbkdf2 params
  const keyBuffer = await crypto.subtle.deriveBits(params, pwKey, 256);                        // derive key
  const keyArray = Array.from(new Uint8Array(keyBuffer));                                      // key as byte array
  const saltArray = Array.from(new Uint8Array(saltUint8));                                     // salt as byte array
  const iterHex = ('000000'+iterations.toString(16)).slice(-6);                                // iter’n count as hex
  const iterArray = iterHex.match(/.{2}/g).map(byte => parseInt(byte, 16));                    // iter’ns as byte array
  const compositeArray = [].concat(saltArray, iterArray, keyArray);                            // combined array
  const compositeStr = compositeArray.map(byte => String.fromCharCode(byte)).join('');         // combined as string
  const compositeBase64 = encodeURI('v01'+compositeStr);                                            // encode as base64

  return compositeBase64;                                                                      // return composite key
}


/**
* Verifies whether the supplied password matches the password previously used to generate the key.
*
* @param   {string}  key - Key previously generated with pbkdf2().
* @param   {string}  password - Password to be matched against previously derived key.
* @returns {Promise<boolean>} Whether password matches key.
*
* @example
*   const match = await pbkdf2Verify(key, 'pāşšŵōřđ'); // true
*/
export async function verify(key, password) {
  let compositeStr = null; // composite key is salt, iteration count, and derived key
  try { compositeStr = decode(key); } catch (e) { throw new Error ('Invalid key'); }             // decode from base64
  
  const version = compositeStr.slice(0, 3);   //  3 bytes
  const saltStr = compositeStr.slice(3, 19);  // 16 bytes (128 bits)
  const iterStr = compositeStr.slice(19, 22); //  3 bytes
  const keyStr  = compositeStr.slice(22, 54); // 32 bytes (256 bits)

  if (version != 'v01') throw new Error('Invalid key');
  
  // -- recover salt & iterations from stored (composite) key
  
  // const saltUint8 = new Uint8Array(saltStr.match(/./g).map(ch => ch.charCodeAt(0)));           // salt as Uint8Array
  const saltUint8 = new Uint8Array(Array.from(saltStr).map(ch => ch.charCodeAt(0)));           // salt as Uint8Array
 
  const iterHex = iterStr.match(/./g).map(ch => ch.charCodeAt(0).toString(16)).join('');       // iter’n count as hex
  const iterations = parseInt(iterHex, 16);                                                    // iter’ns
  
  // -- generate new key from stored salt & iterations and supplied password
  
  const pwUtf8 = new TextEncoder().encode(password);                                           // encode pw as UTF-8
  const pwKey = await crypto.subtle.importKey('raw', pwUtf8, 'PBKDF2', false, ['deriveBits']); // create pw key

  const params = { name: 'PBKDF2', hash: 'SHA-256', salt: saltUint8, iterations: iterations }; // pbkdf params
  const keyBuffer = await crypto.subtle.deriveBits(params, pwKey, 256);                        // derive key
  const keyArray = Array.from(new Uint8Array(keyBuffer));                                      // key as byte array
  const keyStrNew = keyArray.map(byte => String.fromCharCode(byte)).join('');                  // key as string
  
  // console.log('\n', keyStrNew, '\n ===== \n', keyStr)
  return keyStrNew === keyStr; // test if newly generated key matches stored key
}