import SQLite from 'better-sqlite3'
import { SqliteDialect } from "kysely";
import { homedir } from 'node:os';
import { join } from 'node:path';

export const def_dialect = new SqliteDialect(
  {
    database: async () => new SQLite(join(homedir(), 'db.sqlite'))
  }
)