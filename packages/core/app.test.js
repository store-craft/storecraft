import { App } from './index.js';
import { DummyMailer } from './mailer/dummy-mailer.js';
import { NodePlatform } from './platform/node/index.js';
import { api, rest } from './test-runner/index.js';
import { SQLite } from '@storecraft/database-sqlite';
import { migrateToLatest } from '@storecraft/database-sqlite/migrate.js';
import { admin_email } from './test-runner/api/auth.js';

export const create_app = async (print_banner=true) => {
  const app = new App(
    {
      auth_admins_emails: [admin_email],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token',
      auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
      auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new SQLite({ filepath: ':memory:' })
  )
  .withMailer(
    new DummyMailer()
  );
 
  await app.init(print_banner);
  await migrateToLatest(app.db, false);
  
  return app;
}

async function test() {
  const app = await create_app();

  // test twice on a hot database
  for(const i of [0, 1]) {
    { // test api
      Object.entries(api).slice(0).forEach(
        ([name, runner]) => {
          runner.create(app).run();
        }
      );
    }
  
    { // test rest
      Object.entries(rest).slice(0, -1).forEach(
        ([name, runner]) => {
          runner.create(app).run();
        }
      );
      const last_test = Object.values(rest).at(-1).create(app);
      // last_test.after(async () => { await app.db.disconnect() });
      last_test.run();
    }
  }

}

test();
