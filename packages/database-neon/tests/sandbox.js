import 'dotenv/config';
import { App } from '@storecraft/core';
import { Turso } from '@storecraft/database-turso';
import { NodePlatform } from '@storecraft/platform-node';

export const test = async () => {
  let app = new App(
    new NodePlatform(),
    new Turso(
      { 
        prefers_batch_over_transactions: true,
        libsqlConfig: {
          url: process.env.TURSO_URL,
          authToken: process.env.TURSO_API_TOKEN,
        }
      }
    ),
    null, null, {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  );
  
  await app.init();
  await app.db.migrateToLatest(false);

}

test();