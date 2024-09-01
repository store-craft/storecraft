import Database from 'better-sqlite3';

export { SQLite } from './index.js';

/**
 * @description The Storecraft SQLite config
 */
export type Config = {
  /**
   * @description Database filepath, can be ':memory' for in memory session
   * 
   * @default 'database.db'
   */
  filepath?: string,

  /**
   * @description `better-sqlite` options
   */
  options?: Database.Options;
}
