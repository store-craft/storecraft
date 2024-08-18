import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/platforms/node';
import  { api_index } from '@storecraft/test-runner'
import { NeonHttp } from '@storecraft/database-neon';
import { migrateToLatest } from '@storecraft/database-neon/migrate.js';

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new NeonHttp(
      { 
        connectionString: process.env.NEON_CONNECTION_URL
      }
    ),
    null, null, {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  );
  
  return app.init();
}

async function test() {
  const app = await create_app();

  await migrateToLatest(app.db, false);

  Object.entries(api_index).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app).run();
    }
  );
  const last_test = Object.values(api_index).at(-1).create(app);
  last_test.after(async ()=>{app.db.disconnect()});
  last_test.run();
}

test();