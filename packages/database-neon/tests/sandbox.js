import 'dotenv/config';
import { App } from '@storecraft/core';
import { NeonHttp, migrateToLatest } from '@storecraft/database-neon';
import { NodePlatform } from '@storecraft/platform-node';

export const test = async () => {
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
  
  await app.init();
  await migrateToLatest(app.db, false);

}

test();