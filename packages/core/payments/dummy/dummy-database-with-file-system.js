/**
 * @import { Config, DatabasePersistanceProvider } from './dummy-database.types.js'
 */

import * as path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from "node:url";
import { DummyDatabase } from './dummy-database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __db_path = path.resolve(__dirname, 'dummy.json');

/** @type {DatabasePersistanceProvider} */
const persistance_provider = {
  load: async () => {
    try {
      const db = await readFile(
        __db_path, 
        { encoding: 'utf-8' }
      );
      return JSON.parse(db);
    } catch (e) {
      console.log(e);
    }
  },
  save: async (db) => {
    await writeFile(
      __db_path, 
      JSON.stringify(db)
    );
  }
}

/**
 * A simple `key-value` database, with file system persistance
 * @template T
 * @extends {DummyDatabase<T>}
 */
export class DummyDatabaseWithFileSystem extends DummyDatabase {

  /**
   * @param {Omit<Config, 'persistance_provider'>} config 
   */
  constructor(config) {
    super({
      ...config,
      persistance_provider
    });
  }
}