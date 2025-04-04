// @ts-nocheck

import 'dotenv/config';
import { D1_HTTP } from '@storecraft/database-cloudflare-d1';
import { migrateToLatest } from '@storecraft/database-cloudflare-d1/migrate.js';
 
export const migrate = async () => {
  const d1_over_http = new D1_HTTP(
    {
      account_id: process.env.CF_ACCOUNT_ID,
      api_token: process.env.D1_API_KEY,
      database_id: process.env.D1_DATABASE_ID
    }
  )
  
  await migrateToLatest(d1_over_http, true);
}

migrate();