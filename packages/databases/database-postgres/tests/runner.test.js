import 'dotenv/config';
import { App } from '@storecraft/core';
import { Postgres } from '@storecraft/database-postgres';
import { migrateToLatest } from '@storecraft/database-sql-base/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner'

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
    new Postgres({
      pool_config: {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
      }
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
  last_test.after(async () => { await app._.db.disconnect() });
  last_test.run();
}

test();
