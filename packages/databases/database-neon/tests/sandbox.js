import 'dotenv/config';
import { App } from '@storecraft/core';
import { NeonHttp } from '@storecraft/database-neon'
import { migrateToLatest } from '@storecraft/database-neon/migrate.js';
import { NodePlatform } from '@storecraft/platforms/node';

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
    new NeonHttp(
      { 
        connectionString: process.env.NEON_CONNECTION_URL
      }
    )
  )
  
  await app.init();
  await migrateToLatest(app.db, false);

}

test();