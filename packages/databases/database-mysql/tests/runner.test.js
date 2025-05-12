import 'dotenv/config';
import { App } from '@storecraft/core';
import { MySQL } from '@storecraft/database-mysql';
import { migrateToLatest } from '@storecraft/database-mysql/migrate.js';
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
    new MySQL(
      {
        pool_options: {
          database: process.env.MYSQL_DATABASE,
          host: process.env.MYSQL_HOST,
          port: parseInt(process.env.MYSQL_PORT),
          user: process.env.MYSQL_USER,
          password: process.env.MYSQL_PASSWORD,
        }
      }
    )
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
