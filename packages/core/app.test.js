import { App } from './index.js';
import { DummyMailer } from './mailer/dummy-mailer.js';
import { NodePlatform } from './platform/node/index.js';
import  { api } from './test-runner/index.js';
import { SQLite } from '@storecraft/database-sqlite';
import { migrateToLatest } from '@storecraft/database-sqlite/migrate.js';
import { admin_email } from './test-runner/api/auth.js';

export const create_app = async () => {
  const app = new App(
    {
      auth_admins_emails: [admin_email],
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  )
  .withPlatform(new NodePlatform())
  .withDatabase(
    new SQLite({ filepath: ':memory:' })
  )
  .withMailer(
    new DummyMailer()
  );
 
  await app.init();
  await migrateToLatest(app.db, false);
  
  return app;
}

async function test() {
  const app = await create_app();

  Object.entries(api).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app).run();
    }
  );
  const last_test = Object.values(api).at(-1).create(app);
  last_test.after(async () => { await app.db.disconnect() });
  last_test.run();
}

test();

async function test2() {
  const app = await create_app();

  // api_index.api_auth_test.create(app).run();

  api.checkout.create(app).run();

  // api_index.api_tags_crud_test.create(app).run();
  // api_index.api_tags_list_test.create(app).run();

  // api_index.api_collections_crud_test.create(app).run();
  // api_index.api_collections_list_test.create(app).run();
  // api_index.api_collections_products_test.create(app).run();

  // api_index.api_products_crud_test.create(app).run();
  // api_index.api_products_collections_test.create(app).run();
  // api_index.api_products_list_test.create(app).run();
  // api_index.api_products_discounts_test.create(app).run();
  // api_index.api_products_variants_test.create(app).run();

  // api_index.api_shipping_crud_test.create(app).run();
  // api_index.api_shipping_list_test.create(app).run();

  // api_index.api_posts_crud_test.create(app).run();
  // api_index.api_posts_list_test.create(app).run();

  // api_index.api_customers_crud_test.create(app).run();
  // api_index.api_customers_list_test.create(app).run();

  // api_index.api_orders_crud_test.create(app).run();
  // api_index.api_orders_list_test.create(app).run();

  // api_index.api_storefronts_crud_test.create(app).run();
  // api_index.api_storefronts_list_test.create(app).run();
  // api_index.api_storefronts_all_connections_test.create(app).run();

  // api_index.api_notifications_crud_test.create(app).run();
  // api_index.api_notifications_list_test.create(app).run();

  // api_index.api_images_crud_test.create(app).run();
  // api_index.api_images_list_test.create(app).run();

  // api_index.api_discounts_crud_test.create(app).run();
  // api_index.api_discounts_list_test.create(app).run();
  // api_index.api_discounts_products_test.create(app).run();


}

// test2();