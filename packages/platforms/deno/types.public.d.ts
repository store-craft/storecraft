import type { ScryptOptions } from 'node:crypto';

export * from './index.js'

/**
 * @description Core config for `node` platform
 */
export type DenoPlatformConfig = {

  /**
   * @description crypto hasher length
   */
  scrypt_keylen?: number;

  /**
   * @description crypto hasher options
   */
  scrypt_options?: ScryptOptions
}