import 'dotenv/config';
import { App } from '@storecraft/core';
import { Turso } from '@storecraft/database-turso';
import { migrateToLatest } from '@storecraft/database-turso/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';

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
    new Turso(
      { 
        prefers_batch_over_transactions: true,
      }
    )
  );
  
  await app.init();
  await migrateToLatest(app.db, false);

}

test();