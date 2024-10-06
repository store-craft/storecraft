import { App } from '@storecraft/core';
import { NodePlatform } from '@storecraft/core/platform/node';
import { SqliteDialect } from 'kysely';
import { homedir } from 'os';
import { join } from 'path';
import SQLite from 'better-sqlite3'
import { SQL } from '../index.js';
import { migrateToLatest } from '../migrate.js';

export const sqlite_dialect = new SqliteDialect({
  database: async () => new SQLite(join(homedir(), 'db.sqlite')),
});

export const create_app = async () => {

  const app = new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new SQL({
      dialect: sqlite_dialect, 
      dialect_type: 'SQLITE'
    })
  )
 
  await app.init();
  await migrateToLatest(app.db, false);
  
  return app;
}

/**
 * 
 * @template R
 * 
 * @param {(()=>Promise<R>) | (() => R)} fn 
 */
const withTime = async (fn) => {
  const n1 = Date.now() ;
  const r = await fn();
  const delta = Date.now() - n1;
  console.log(delta);
  return r;
}

async function test() {
  const app = await withTime(create_app);

  await migrateToLatest(app.db, false);


  const doit = async () => {
    let items = await app.db.resources.search.quicksearch(
      {
        vql: 'ship 2', 
        sortBy: ['updated_at']
      }
    );
    return items;
  }

  const items = await withTime(doit);

  // console.log('items ', items)
}

test();

