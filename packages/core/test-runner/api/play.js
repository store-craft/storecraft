import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb';
import { NodePlatform } from '@storecraft/core/platform/node';

export const admin_email = 'admin@sc.com';
export const admin_password = 'password';

export const create_app = async () => {
  const app = new App(
    {
      auth_admins_emails: [admin_email],
      auth_secret_access_token: '****',
      auth_secret_refresh_token: '****',
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(new MongoDB())
  
  return app.init();
}
