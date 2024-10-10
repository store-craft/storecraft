/**
 * @import { PlatformAdapter } from '../types.public.js';
 */
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * @description node platform crypto using `scrypt`
 */
export class NodeCrypto {

  /**
   * 
   * @param {number} [scrypt_keylen=64]
   * @param {import('node:crypto').ScryptOptions} [scrypt_options]
   */
  constructor(scrypt_keylen=64, scrypt_options={}) {
    this.scrypt_keylen = scrypt_keylen;
    this.scrypt_options = scrypt_options;
  }

  /**
   * @description hash a password using `scrypt`
   * @type {PlatformAdapter["crypto"]["hash"]} 
   */
  hash(password) {
    return new Promise(
      (resolve, reject) => {
        // generate random 16 bytes long salt - recommended by NodeJS Docs
        const salt = randomBytes(16).toString("hex");

        scrypt(
          password, salt, this.scrypt_keylen, this.scrypt_options,
          (err, derivedKey) => {
            if (err) reject(err);
            // derivedKey is of type Buffer
            resolve(`${salt}.${derivedKey.toString("hex")}`);
          }
        );
      }
    );
  }

  /**
   * @description verify a hashed password using `scrypt`
   * @type {PlatformAdapter["crypto"]["verify"]} 
   */
  verify(hash, password) {
    return new Promise(
      (resolve, reject) => {
        const [salt, hashKey] = hash?.split(".");

        if(!salt || !hashKey)
          reject(false);

        // we need to pass buffer values to timingSafeEqual
        const hashKeyBuff = Buffer.from(hashKey, "hex");
        scrypt(
          password, salt, this.scrypt_keylen, this.scrypt_options, 
          (err, derivedKey) => {
            if (err) reject(err);
            // compare the new supplied password with the 
            // hashed password using timeSafeEqual
            resolve(timingSafeEqual(hashKeyBuff, derivedKey));
          }
        );
      }
    );
  }
} 