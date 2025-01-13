import 'dotenv/config';
import { App } from '@storecraft/core';
import { MongoDB, migrateToLatest } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner';

export const create_app = async () => {
  const app = new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new MongoDB(
      { 
        db_name: process.env.MONGODB_NAME,
        url: process.env.MONGODB_URL
      }
    )
  )
  
  return app.init();
}

async function test() {
  const app = await create_app();

  await migrateToLatest(app.db, false);

  // api.collections_list.create(app).run();

  Object.entries(api).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app).run();
    }
  );
  const last_test = Object.values(api).at(-1).create(app);
  last_test.after(async ()=>{app.db.disconnect()});
  last_test.run();
}

test();