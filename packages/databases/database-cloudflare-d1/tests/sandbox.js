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
      auth_secret_refresh_token: 'auth_secret_refresh_token',
      auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
      auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new D1_HTTP(
      { 
        account_id: process.env.CF_ACCOUNT_ID, 
        database_id: process.env.D1_DATABASE_ID, 
        api_token: process.env.D1_API_KEY,
        db_name: process.env.CLOUDFLARE_DATABASE_NAME
      }
    )
  ).init();
  
  await migrateToLatest(app.__show_me_everything.db, false);

}

test();