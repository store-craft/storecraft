import { NeonConfig, PoolConfig } from '@neondatabase/serverless';
export { NeonHttp, NeonServerless } from './index.js';

/**
 * @description The main serverless with `websockets` support for interactive
 * transactions config dialect
 */
export type NeonServerlessConfig = {

  neonConfig: NeonConfig;
  poolConfig: PoolConfig
}



/**
 * @description The `http` only config
 */
export type NeonHttpConfig = {

  /**
   * @description `neon` connection string
   */
  connectionString: string
}
