import { App } from '@storecraft/core';
import { SQL } from '@storecraft/database-sql-base';
import { NodePlatform } from '@storecraft/platform-node';
import  { api_index } from '@storecraft/test-runner'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely';
import { homedir } from 'node:os';
import { join } from 'node:path';

export const sqlite_dialect = new SqliteDialect({
  database: async () => new SQLite(join(homedir(), 'db.sqlite')),
});

export const create_app = async () => {
  let app = new App(
    new NodePlatform(),
    new SQL({
      dialect: sqlite_dialect, 
      dialect_type: 'SQLITE'
    }),
    null, null, null, null, {
      admins_emails: ['admin@sc.com'],
      auth_password_hash_rounds: 100,
      auth_secret_access_token: 'auth_secret_access_token',
      auth_secret_refresh_token: 'auth_secret_refresh_token'
    }
  );
 
  await app.init();
  await app.db.migrateToLatest();
  return app;
}

async function test() {
  const app = await create_app();

  Object.entries(api_index).slice(0, -1).forEach(
    ([name, runner]) => {
      runner.create(app).run();
    }
  );
  const last_test = Object.values(api_index).at(-1).create(app);
  last_test.after(async () => { await app.db.disconnect() });
  last_test.run();
}

test();

async function test2() {
  const app = await create_app();

  api_index.api_auth_test.create(app).run();

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