import type { ScryptOptions } from 'crypto';

export type * from './index.js'

/**
 * @description Core config for `node` platform
 */
export type NodePlatformConfig = {

  /**
   * @description crypto hasher length
   */
  scrypt_keylen?: number;

  /**
   * @description crypto hasher options
   */
  scrypt_options?: ScryptOptions
}
