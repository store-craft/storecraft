import { App } from './index.js';
import { DummyMailer } from './mailer/dummy-mailer.js';
import { NodePlatform } from './platform/node/index.js';
import { SQLite } from '@storecraft/database-sqlite';
import { migrateToLatest } from '@storecraft/database-sqlite/migrate.js';
import { admin_email } from './test-runner/api/auth.js';
import { PostmanExtension } from './extensions/postman/index.js';

/**
 * Create an `App` instance for testing.
 * @param {boolean} [print_banner=true]
 * @returns 
 */
export const create_app = async (print_banner=true) => {
  const app = new App(
    {
      auth_admins_emails: [admin_email],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token',
      auth_secret_forgot_password_token: 'auth_secret_forgot_password_token',
      auth_secret_confirm_email_token: 'auth_secret_confirm_email_token',
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new SQLite({ filepath: ':memory:' })
  )
  .withMailer(
    new DummyMailer()
  )
  .withExtensions(
    {
      'postman': new PostmanExtension(),
    }
  );
 
  await app.init(print_banner);
  await migrateToLatest(app.db, false);
  
  return app;
}
