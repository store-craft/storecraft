import { App } from './index.js';
import { DummyMailer } from './mailer/dummy-mailer.js';
import { NodePlatform } from './platform/node/index.js';
import { SQLite } from '@storecraft/database-sqlite';
import { migrateToLatest } from '@storecraft/database-sqlite/migrate.js';
import { admin_email } from './test-runner/api/auth.js';
import { PostmanExtension } from './extensions/postman/index.js';
import { DummyPayments } from './payments/dummy/index.js';
import { DummyExtension } from './extensions/dummy/index.js';
import { UniformTaxes } from './tax/public.js';
import { NodeLocalStorage } from './storage/node/index.js';

/**
 * Create an `App` instance for testing.
 * @param {boolean} [print_banner=true]
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
  .withStorage(
    new NodeLocalStorage('storage-test')
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
      dummy: new DummyExtension()
    }
  )
  .withPaymentGateways(
    {
      dummy: new DummyPayments({ intent_on_checkout: 'AUTHORIZE' }),
      'dummy_payments' : new DummyPayments({ intent_on_checkout: 'AUTHORIZE' })
    }
  )
  .withTaxes(new UniformTaxes(10))
 
  await app.init(print_banner);
  await migrateToLatest(app.db, false);
  
  return app;
}
