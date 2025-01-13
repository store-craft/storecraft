import 'dotenv/config';
import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner';
import { NeonHttp, NeonServerless } from '@storecraft/database-neon';
import { migrateToLatest } from '@storecraft/database-neon/migrate.js';

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
    new NeonHttp(
      { 
        connectionString: process.env.NEON_CONNECTION_URL
      }
    )
  );
  
  return app.init();
}

async function test() {
  const app = await create_app();

  await migrateToLatest(app.db, false);

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