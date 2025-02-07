import 'dotenv/config';
import { App } from '@storecraft/core';
import { D1_HTTP } from '@storecraft/database-cloudflare-d1';
import { migrateToLatest } from '@storecraft/database-cloudflare-d1/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import  { api } from '@storecraft/core/test-runner'

export const test = async () => {
  const app = new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new D1_HTTP(
      { 
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID, 
        database_id: process.env.CLOUDFLARE_D1_DATABASE_ID, 
        api_token: process.env.CLOUDFLARE_D1_API_TOKEN,
        db_name: process.env.CLOUDFLARE_DATABASE_NAME
      }
    )
  );
  
  await app.init();
  await migrateToLatest(app.db, false);

}

test();