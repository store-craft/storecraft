import 'dotenv/config';
import { App } from '@storecraft/core';
import { MongoDB } from '@storecraft/database-mongodb';
import { migrateToLatest } from '@storecraft/database-mongodb/migrate.js';
import { NodePlatform } from '@storecraft/core/platform/node';
import { expand } from '../src/con.shared.js';
import { sanitize_hidden, sanitize_recursively } from '../src/utils.funcs.js';

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
  
  await app.init();
  await migrateToLatest(app.db, false);
  return app;
}


async function test() {
  const app = await create_app();


  const db = app.db.db;

  /** @type {Partial<import('@storecraft/core/api').StorefrontType>[]} */
  const items = await db.aggregate(
    [
      { $documents: [ {} ] },
      {
        $lookup: {
          from: "products",
          pipeline: [
            { $match: { active: true } },
            { $sort: { updated_at: -1} },
            { $limit: 10 },
          ],
          as: "products"
        }
      },
      {
        $lookup: {
          from: "collections",
          pipeline: [
            { $match: { active: true } },
            { $sort: { updated_at: -1} },
          ],
          as: "collections"
        }
      },
      {
        $lookup: {
          from: "discounts",
          pipeline: [
            { $match: { active: true } },
            { $sort: { updated_at: -1} },
          ],
          as: "discounts"
        }
      },
      {
        $lookup: {
          from: "shipping_methods",
          pipeline: [
            { $match: { active: true } },
            { $sort: { updated_at: -1} },
          ],
          as: "shipping_methods"
        }
      },
      {
        $lookup: {
          from: "posts",
          pipeline: [
            { $match: { active: true } },
            { $sort: { updated_at: -1} },
            { $limit: 5 },
          ],
          as: "posts"
        }
      },
      {
        $lookup: {
          from: "products",
          pipeline: [
            { $match: { active: true } },
            { $project: { tags: 1 }}
          ],
          as: "all_products_tags"
        }
      },

    ]
  ).toArray();

  const pre_all_tags = /** @type {{tags?: string[]}[]} */(
    items[0].all_products_tags ?? []
  );
  const all_products_tags = pre_all_tags.reduce(
    (p, c) => {
      (c?.tags ?? []).forEach(
        (tag) => p.add(tag)
      );
      return p;
    }, 
    /** @type {Set<string>} */ (new Set())
  );

  let sf = {
    ...items[0],
    active: true,
    created_at: new Date().toISOString(),
    handle: 'default-auto-generated-storefront',
    id: 'default',
    title: 'Default Auto Generated Storefront',
    description: 'Default Auto Generated Storefront',
    all_products_tags: Array.from(all_products_tags)
  }

  expand(
    sf.products,
    [
      'discounts', 'collections', 
      'related_products', 'variants'
    ],
  );

  sanitize_recursively(
    sf
  );

  console.log(JSON.stringify(sf, null, 2));

  await app.db.disconnect();
}

test();

