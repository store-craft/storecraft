import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb';
import { migrateToLatest } from '@storecraft/database-mongodb/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';

export const create_app = async () => {
  const app = new App(
    {
      auth_admins_emails: ['admin@sc.com'],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB({ db_name: 'test'}))
  
  return app.init();
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
        vql: '', 
        sortBy: ['updated_at']
      }
    );
    return items;
  }

  const items = await withTime(doit);

  // console.log('items ', items)
}

test();

