import 'dotenv/config';
import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner'
import { PlanetScale } from '@storecraft/database-planetscale';
import { migrateToLatest } from '@storecraft/database-planetscale/migrate.js';

export const create_app = async () => {
  
  return new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new PlanetScale(
      { 
        url: process.env.PLANETSCALE_CONNECTION_URL,
        useSharedConnection: true
      }
    )
  ).init();
}

async function test() {
  const app = await create_app();

  await migrateToLatest(app._.db, false);

  Object.entries(api).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app._.app).run();
    }
  );
  const last_test = Object.values(api).at(-1).create(app._.app);
  last_test.after(async ()=>{app._.disconnect()});
  last_test.run();
}

test();