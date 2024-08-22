import type { Config } from '@planetscale/database'

export { PlanetScale } from './index.js'

/**
 * @description Config for the PlanetScale dialect. It extends {@link Config} from `@planetscale/database`,
 * so you can pass any of those options to the constructor.
 *
 * @see https://github.com/planetscale/database-js#usage
 */
export interface PlanetScaleDialectConfig extends Config {
  /**
   * Use a single `@planetscale/database` connection for all non-transaction queries.
   *
   * @default false
   */
  useSharedConnection?: boolean
}
