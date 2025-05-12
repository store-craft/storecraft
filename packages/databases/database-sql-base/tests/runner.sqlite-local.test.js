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

export const sqlite_dialect = new SqliteDialect({
  database: async () => new SQLite(':memory:'),
});

export const create_app = async () => {
  const app = new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token',
      auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
      auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new SQL({
      dialect: sqlite_dialect, 
      dialect_type: 'SQLITE'
    })
  ).init();
 
  await migrateToLatest(app._.db, false);
  
  return app;
}

async function test() {
  const app = await create_app();

  Object.entries(api).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app._.app).run();
    }
  );
  const last_test = Object.values(api).at(-1).create(app._.app);
  last_test.after(async () => { await app._.disconnect() });
  last_test.run();
}

test();
