export type * from './index.js'


/**
 * @description config for workers
 */
export type Config = {

  /**
   * @description number of hash iterations for pbkdf2
   * @default 1000
   */
  hash_iterations?: number;

  /**
   * @description workers env
   */
  env?: Record<string, any>;

}