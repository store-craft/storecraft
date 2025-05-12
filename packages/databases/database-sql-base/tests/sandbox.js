/**
 * @import {Database} from '../types.sql.tables.js';
 */
import 'dotenv/config';
import { App } from '@storecraft/core';
import { SQL } from '@storecraft/database-sql-base';
import { migrateToLatest } from '@storecraft/database-sql-base/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import { api } from '@storecraft/core/test-runner'
import SQLite from 'better-sqlite3'
import { SqliteDialect } from 'kysely';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { jsonArrayFrom, stringArrayFrom } from '../src/con.helpers.json.js';
import { products_with_collections, products_with_discounts, products_with_related_products, products_with_variants, with_media, with_tags } from '../src/con.shared.js';

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
  ).init();
 
  await migrateToLatest(app._.db, false);
  
  return app;
}

/**
 * @template {keyof Database} [T=keyof Database]
 * @typedef {{}}
 */

/**
 * @type {Record<keyof Database, (keyof Database['collections'])[]>}
 */

/**
 * @type {{[K in keyof Database]?: (keyof Database[K])[]}}
 */
const resource_to_props = (
  {
    'collections': ['active', 'attributes', 'created_at', 'description', 'handle', 'id', 'published', 'title', 'updated_at'],
    'discounts': ['active', 'application', 'attributes', 'created_at', 'description', 'handle', 'id', 'info', 'priority', 'published', 'title', 'updated_at'],
    'products': ['active', 'attributes', 'compare_at_price', 'created_at', 'description', 'handle', 'id', 'isbn', 'parent_handle', 'parent_id', 'price', 'qty', 'title', 'updated_at', 'variant_hint', 'variants_options', 'video'],
    'shipping_methods': ['active', 'attributes', 'created_at', 'description', 'handle', 'id', 'price', 'title', 'updated_at'],
    'posts': ['active', 'attributes', 'created_at', 'description', 'handle', 'id', 'text', 'title', 'updated_at'],
  }
);


async function test() {
  const app = await create_app();
  const client = app._.db.client;
  const dialectType = app._.db.dialectType;
  const limit = 0;
  const items = await client.selectNoFrom(
    eb => [
      jsonArrayFrom(
        eb
        .selectFrom('collections')
        .select(resource_to_props.collections)
        .select(
          eb => [
            with_tags(eb, eb.ref('collections.id'), dialectType),
            with_media(eb, eb.ref('collections.id'), dialectType),
          ]
        )
        .where('active', '=', 1)
        .orderBy('updated_at', 'asc')
        .limit(limit),
        dialectType
      ).as('collections'),

      jsonArrayFrom(
        eb
        .selectFrom('products')
        .select(resource_to_props.products)
        .select(
          eb => [
            with_tags(eb, eb.ref('products.id'), dialectType),
            with_media(eb, eb.ref('products.id'), dialectType),
            products_with_collections(eb, eb.ref('products.id'), dialectType),
            products_with_discounts(eb, eb.ref('products.id'), dialectType),
            products_with_variants(eb, eb.ref('products.id'), dialectType),
            products_with_related_products(eb, eb.ref('products.id'), dialectType),
          ]
        )
        .where('active', '=', 1)
        .orderBy('updated_at', 'asc')
        .limit(limit),
        dialectType
      ).as('products'),

      jsonArrayFrom(
        eb
        .selectFrom('discounts')
        .select(resource_to_props.discounts)
        .select(
          eb => [
            with_tags(eb, eb.ref('discounts.id'), dialectType),
            with_media(eb, eb.ref('discounts.id'), dialectType),
          ]
        )
        .where('active', '=', 1)
        .orderBy('updated_at', 'asc')
        .limit(limit),
        dialectType
      ).as('discounts'),

      jsonArrayFrom(
        eb
        .selectFrom('shipping_methods')
        .select(resource_to_props.shipping_methods)
        .select(
          eb => [
            with_tags(eb, eb.ref('shipping_methods.id'), dialectType),
            with_media(eb, eb.ref('shipping_methods.id'), dialectType),
          ]
        )
        .where('active', '=', 1)
        .orderBy('updated_at', 'asc')
        .limit(limit),
        dialectType
      ).as('shipping_methods'),

      jsonArrayFrom(
        eb
        .selectFrom('posts')
        .select(resource_to_props.posts)
        .select(
          eb => [
            with_tags(eb, eb.ref('posts.id'), dialectType),
            with_media(eb, eb.ref('posts.id'), dialectType),
          ]
        )
        .where('active', '=', 1)
        .orderBy('updated_at', 'asc')
        .limit(limit),
        dialectType
      ).as('posts'),

      stringArrayFrom(
        eb.selectFrom('products')
        .innerJoin(
          'products_to_collections', 
          'products_to_collections.entity_id', 
          'products.id'
        )
        .innerJoin(
          'entity_to_tags_projections', 
          'entity_to_tags_projections.entity_id', 
          'products.id'
        )
        .select('entity_to_tags_projections.value as tag')
        .groupBy('tag'),
        dialectType
      ).as('all_products_tags')
    ]
  )
  .executeTakeFirst();

  console.log(JSON.stringify(items, null, 2))
}

async function test2() {
  const app = await create_app();
  const client = app._.db.client;
  const items = await client.selectNoFrom(
    eb => Object
    .entries(resource_to_props)
    .map(
      /**
       * @param {[keyof Database, (keyof Database[keyof Database])[]]} params
       */
      ([table_name, props]) => {
        // console.log(table_name, props)
        // props
        return jsonArrayFrom(
          eb
          .selectFrom(table_name)
          .select(props)
          .orderBy('updated_at', 'asc')
          .limit(0),
          app._.db.dialectType
        ).as(table_name)
      }
    )
  )
  .executeTakeFirst();

  console.log(JSON.stringify(items, null, 2))
}

test();

