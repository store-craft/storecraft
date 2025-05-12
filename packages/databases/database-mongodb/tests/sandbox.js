import 'dotenv/config';
import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb';
import { migrateToLatest } from '@storecraft/database-mongodb/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import { expand } from '../src/con.shared.js';
import { sanitize_hidden, sanitize_recursively } from '../src/utils.funcs.js';

export const create_app = async () => {
  const app = new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB({ db_name: 'test'}))
  .init();
  
  await migrateToLatest(app.__show_me_everything.db, false);
  return app;
}


async function test() {
  const app = await create_app();
  const db = app.__show_me_everything.db;
  const sf = await db.resources.storefronts.get_default_auto_generated_storefront()

  console.log(JSON.stringify(sf, null, 2));

  await db.disconnect();
}

test();

