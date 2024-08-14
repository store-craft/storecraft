import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/platform-node';
import  { api_index } from '@storecraft/test-runner'
import { migrateToLatest, PlanetScale } from '@storecraft/database-planetscale';

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new PlanetScale(
      { 
        url: process.env.PLANETSCALE_CONNECTION_URL,
        useSharedConnection: true
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