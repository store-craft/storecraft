import 'dotenv/config';
import { App } from '@storecraft/core';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner';

//
// Main MongoDB test suite with the core test-runner for api layer
//

export const create_app = () => {
  return new App(
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
    new MongoDB(
      { 
        db_name: process.env.MONGODB_NAME,
        url: process.env.MONGODB_URL,
      }
    )
  ).init();
}

async function test() {
  const app = create_app();

  await migrateToLatest(app._.db, false);
 
  Object.entries(api).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app._.app).run();
    }
  );
  
  const last_test = Object.values(api).at(-1).create(app._.app);
  last_test.after(async ()=>{app._.db.disconnect()});
  last_test.run();
}

// twice
test();