import { infer_database } from './compile.app.js'

/**
 * 
 * @param {string} db_dep 
 */
const regular_migrate = (db_dep) => {

  return `
import 'dotenv/config';
import { app } from './app.js';
import { migrateToLatest } from '${db_dep}/migrate.js';
 
await app.init();
await migrateToLatest(app.db, true);
`
}


const d1_migrate = () => {
  return `#!/usr/bin/env node

import 'dotenv/config';
import { D1_HTTP } from '@storecraft/database-cloudflare-d1';
import { migrateToLatest } from '@storecraft/database-cloudflare-d1/migrate.js';
 
export const migrate = async () => {
  const d1_over_http = new D1_HTTP(
    {
      account_id: process.env.CF_ACCOUNT_ID,
      api_token: process.env.D1_API_TOKEN,
      database_id: process.env.D1_DATABASE_ID
    }
  )
  
  await migrateToLatest(d1_over_http, true);
}

migrate();  
`
}

/**
 * 
 * @param {import('./compile.app.js').Meta} meta 
 */
export const compile_migrate = (meta) => {
  const database = infer_database(meta.database);

  switch(meta.database.id) {
    case 'd1': {
      return d1_migrate();
    }
    case 'sqlite':
    case 'libsql-local':
    case 'postgres':
    case 'mysql':
    case 'mongo_db':
    case 'turso':
    case 'neon_http':
    case 'neon_ws':
    case 'planetscale': {
      return regular_migrate(database.deps[0]);
    }
  }

  return '';
}


