import 'dotenv/config';
import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/platforms/node';
import { PlanetScale } from '../index.js';
import { migrateToLatest } from '../migrate.js';

export const test = async () => {
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
  
  await app.init();
  await migrateToLatest(app.db, false);

}

test();