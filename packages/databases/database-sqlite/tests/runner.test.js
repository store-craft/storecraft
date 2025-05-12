import { App } from '@storecraft/core';
import { SQLite } from '@storecraft/database-sqlite';
import { migrateToLatest } from '@storecraft/database-sqlite/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { NodeLocalStorage } from '@storecraft/core/storage/node';

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
    new SQLite({ filepath: ':memory:' })
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
  last_test.after(async () => { await app._.db.disconnect() });
  last_test.run();
}

test();
