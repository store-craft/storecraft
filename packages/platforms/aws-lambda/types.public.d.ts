import type { ScryptOptions } from 'crypto';
export type { LambdaEvent, LambdaContext } from './types.private.d.ts';
export { AWSLambdaPlatform } from './index.js';

/**
 * @description Core config for `node` platform
 */
export type AWSLambdaConfig = {

  /**
   * @description crypto hasher length
   */
  scrypt_keylen?: number;

  /**
   * @description crypto hasher options
   */
  scrypt_options?: ScryptOptions
}
