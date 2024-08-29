import Database from 'better-sqlite3';

export { SQLite } from './index.js';

/**
 * @description The Storecraft SQLite config
 */
export type Config = {
  /**
   * @description Database filename, can be ':memory' for in memory session
   * 
   */
  filename: string,

  /**
   * @description `better-sqlite` options
   */
  options?: Database.Options;
}
