import { NeonConfig, PoolConfig } from '@neondatabase/serverless';
export * from './index.js'

/**
 * @description The main serverless with `websockets` support for interactive
 * transacrions config dialect
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