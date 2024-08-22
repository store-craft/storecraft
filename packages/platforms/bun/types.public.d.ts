import type { ScryptOptions } from 'node:crypto';
export { BunPlatform } from './index.js';

/**
 * @description Core config for platform
 */
export type BunPlatformConfig = {

  /**
   * @description crypto hasher length
   */
  scrypt_keylen?: number;

  /**
   * @description crypto hasher options
   */
  scrypt_options?: ScryptOptions
}
