import SQLite from 'better-sqlite3'
import { SqliteDialect } from "kysely";
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const folder = join(homedir(), 'tomer');
try { mkdirSync(folder) } catch(e) {}
export const def_dialect = new SqliteDialect(
  {
    onCreateConnection: async conn => {
      // console.log('onCreateConnection');
    },
    database: async () => {
      console.log('database init');
      return new SQLite(join(folder, 'db.sqlite'));
    }
    
    // database: new SQLite(':memory:')
  }
)