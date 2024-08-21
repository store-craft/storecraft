import type { ScryptOptions } from 'node:crypto';

export { GoogleFunctionsPlatform } from './index.js';

/**
 * @description Core config for `node` platform
 */
export type Config = {

  /**
   * @description crypto hasher length
   */
  scrypt_keylen?: number;

  /**
   * @description crypto hasher options
   */
  scrypt_options?: ScryptOptions
}
