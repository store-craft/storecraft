import { NeonConfig, PoolConfig } from '@neondatabase/serverless';
export { NeonHttp, NeonServerless } from './index.js';

/**
 * @description The main serverless with `websockets` support for interactive
 * transactions config dialect
 */
export type NeonServerlessConfig = {

  neonConfig?: NeonConfig;
  /**
   * @description `pool` config, if missing the `connectionString`, will be 
   * inferred by the `NEON_CONNECTION_URL` env variable
   */
  poolConfig?: PoolConfig;
}



/**
 * @description The `http` only config
 */
export type NeonHttpConfig = {

  /**
   * @description `neon` connection string, if missing, will be 
   * inferred by the `NEON_CONNECTION_URL` env variable
   */
  connectionString?: string
}
