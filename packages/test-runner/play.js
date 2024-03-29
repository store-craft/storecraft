import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb-node';
import { NodePlatform } from '@storecraft/platform-node';

export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new MongoDB({ db_name: 'test'}),
    null, null, null, {
      admins_emails: [admin_email],
    }
  );
  
  return app.init();
}
