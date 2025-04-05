import 'dotenv/config';
import { App } from '@storecraft/core';
import { SQL } from '@storecraft/database-sql-base';
import { migrateToLatest } from '@storecraft/database-sql-base/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { up } from '../migrations.sqlite/00000_init_tables.js'
import { AggregateDialect } from '../kysely.aggregate.dialect.js'

export const sqlite_dialect = new SqliteDialect(
  {
    database: async () => new SQLite(join(homedir(), 'db.sqlite')),
  }
);

export const test = async () => {
  const aggregate_dialect = new AggregateDialect(
    {
      dialect: sqlite_dialect,
    }
  );

  const db = new SQL({
    dialect: aggregate_dialect,
    dialect_type: 'SQLITE'
  });

  await up(db.client);

  const queries = aggregate_dialect.queries;
  console.log({queries})

}
test();
