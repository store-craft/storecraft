import 'dotenv/config';
import { D1_HTTP } from '@storecraft/database-cloudflare-d1';
import { migrateToLatest } from '@storecraft/database-cloudflare-d1/migrate.js';
 
const migrate = async () => {
  const d1_over_http = new D1_HTTP(
    {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
      api_token: process.env.CLOUDFLARE_D1_API_TOKEN,
      database_id: process.env.CLOUDFLARE_D1_DATABASE_ID
    }
  )
  
  await migrateToLatest(d1_over_http, true);
}

migrate();