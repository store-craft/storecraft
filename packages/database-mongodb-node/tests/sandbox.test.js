import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb-node';
import { NodePlatform } from '@storecraft/platform-node';
import  { api_index } from '@storecraft/test-runner'

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new MongoDB({ db_name: 'test'}),
    null, null, {
      auth_admins_emails: ['admin@sc.com'],
      auth_password_hash_rounds: 100,
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  );
  
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

  await app.db.migrateToLatest(false);


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

