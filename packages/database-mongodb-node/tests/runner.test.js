import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb-node';
import { NodePlatform } from '@storecraft/platform-node';
import  { api_index } from '@storecraft/test-runner'
export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new MongoDB({ db_name: 'test'}),
    null, null, null, {
      admins_emails: [admin_email],
      auth_password_hash_rounds: 100,
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  );
  
  return app.init();
}

async function test() {
  const app = await create_app();
  Object.entries(api_index).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app).run();
    }
  );
  const last_test = Object.values(api_index).at(-1).create(app);
  last_test.after(async ()=>app.db.disconnect());
  last_test.run();
}

test();