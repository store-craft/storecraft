import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ZodSchema, z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { stringify as YAMLStringify } from 'yaml'
import {
  apiAuthRefreshTypeSchema,
  apiAuthResultSchema,
  apiAuthSigninTypeSchema,
  apiAuthSignupTypeSchema,
  authUserTypeSchema,
  collectionTypeSchema,
  collectionTypeUpsertSchema,
  customerTypeSchema,
  customerTypeUpsertSchema,
  discountTypeSchema,
  discountTypeUpsertSchema,
  imageTypeSchema,
  imageTypeUpsertSchema,
  notificationTypeSchema,
  notificationTypeUpsertSchema,
  orderDataSchema,
  orderDataUpsertSchema,
  postTypeSchema,
  postTypeUpsertSchema,
  productTypeSchema,
  productTypeUpsertSchema,
  shippingMethodTypeSchema,
  shippingMethodTypeUpsertSchema,
  storefrontTypeSchema,
  storefrontTypeUpsertSchema,
  tagTypeSchema, tagTypeUpsertSchema,
  variantTypeSchema,
  variantTypeUpsertSchema
} from '../v-api/types.autogen.zod.api.js'
import * as path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from "node:url";
//
// This file creates an OpenAPI file
//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
extendZodWithOpenApi(z);


// Register definitions here
const create_query = () => {
  const cursor = z.string().openapi(
    { 
      examples: [
        '(updated_at:2024-01-24T20:28:24.126Z, id:tag_65b172ebc4c9552fd46c1027)'
      ],
      description: 'A cursor in CSV format of key and values, example: \
      `(updated_at:2024-01-24T20:28:24.126Z, id:tag_65b172ebc4c9552fd46c1027)`'
    }
  );

  return z.object({
    limit: z.number().openapi(
      { 
        example: 10, default: 10, 
        description: 'Limit of filtered results' 
      }
    ),
    startAt: cursor,
    startAfter: cursor,
    endAt: cursor,
    endBefore: cursor,
    sortBy: z.string().openapi(
      { 
        examples: ['(updated_at, id)'],
        description: 'A cursor of Keys in CSV format, example: `(updated_at, id)`',
        default: '`(updated_at, id)`'
      }
    ),
    order: z.enum(['asc', 'desc']).openapi(
      { 
        examples: ['asc', 'desc'],
        description: 'Order of sort cursor, values are `asc` or `desc`',
        default: 'desc'
      }
    ),
    vql: z.string().openapi(
      { 
        examples: ["(term1 & (term2 | -term3))"],
        description: 'Every item has a recorded search terms which you can use \
        to refine your filtering with `VQL` boolean language, example: "term1 & (term2 | -term3)"'
      }
    ),
    expand: z.string().openapi(
      {
        examples: [],
        description: 'A CSV of keys of connections to expand, example `(search, discounts, collections, *)`',
        default: '*'
      }
    )
  });
}

const create_all = () => {
  const registry = new OpenAPIRegistry();

  register_auth(registry);
  register_tags(registry);
  register_collections(registry);
  register_products(registry);
  register_shipping(registry);
  register_customers(registry);
  register_auth_users(registry);
  register_discounts(registry);
  register_images(registry);
  register_notifications(registry);
  register_orders(registry);
  register_posts(registry);
  register_storefronts(registry);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const out = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'StoreCraft API',
      description: 'This is the API',
    },
    servers: [{ url: 'v1' }],
    security: []
  });
  
  writeFile(
    path.join(__dirname, 'openapi.yaml'), 
    YAMLStringify(out)
  );
  
  writeFile(
    path.join(__dirname, 'openapi.json'), 
    JSON.stringify(out)
  );
  
  // console.log(JSON.stringify(out, null, 2))
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {string} example_id 
 * @param {ZodSchema} zod_schema 
 * @param {z.infer<typeof zod_schema>} example 
 */
const register_base_get = (registry, slug_base, name, tags, example_id, zod_schema, example) => {
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}`,
    description: `Get ${name} data by its \`id\` or \`handle\``,
    summary: `Get a single ${name}`,
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `Object with ${name} data.`,
        content: {
          'application/json': {
            schema: zod_schema,
            example
          },
        },
      },
    },
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {string} example_id 
 * @param {ZodSchema} zod_schema 
 * @param {z.infer<typeof zod_schema>} example 
 */
const register_base_upsert = (registry, slug_base, name, tags, example_id, zod_schema, example) => {
  
  registry.registerPath({
    method: 'post',
    path: `/${slug_base}`,
    description: `Upsert a \`${name}\``,
    summary: `Upsert a single ${name}`,
    tags,
    request: {
      body: {
        content: {
          "application/json": {
            schema: zod_schema,
          },
        },
      }
    },
    responses: {
      200: {
        description: 'ID of upserted data',
        content: {
          "application/json": {
            schema: z.string(),
            example: example_id
          },
        },
      },
    },
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 */
const register_base_delete = (registry, slug_base, name, tags) => {
  
  registry.registerPath({
    method: 'delete',
    path: `/${slug_base}/{id_or_handle}`,
    description: `Delete a \`${name}\``,
    summary: 'Delete a single item',
    tags,
    request: {
    },
    responses: {
      200: {
        description: 'Item was deleted',
      }
    },
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {ZodSchema} zod_schema 
 * @param {z.infer<typeof zod_schema>} example 
 */
const register_base_list = (registry, slug_base, name, tags, zod_schema, example) => {
  
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}?limit={limit}&startAt={startAt}&endAt={endAt}&startAfter={startAfter}&endBefore={endBefore}&sortBy={sortBy}&order={order}&vql={vql}&expand={expand}`,
    summary: `List and filter ${name} items`,
    description: 'List and filter items',
    tags,
    request: {
      query: create_query()
    },
    responses: {
      200: {
        description: `List of \`${name}s\``,
        content: {
          'application/json': {
            schema: z.array(zod_schema),
            example: [example]
          },
        },
      },
    },
  });

}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_auth = registry => {
  const tags = ['auth'];
  const _signupTypeSchema = registry.register('AuthSignup', apiAuthSignupTypeSchema);
  const _signinTypeSchema = registry.register('AuthSignin', apiAuthSigninTypeSchema);
  const _refreshTypeSchema = registry.register(`AuthRefresh`, apiAuthRefreshTypeSchema);
  const example = {
    "token_type": "Bearer",
    "user_id": "au_65f98390d6a34550cdc651a1",
    "access_token": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdV82NWY5ODM5MGQ2YTM0NTUwY2RjNjUxYTEiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3MTA4NTEwMDksImV4cCI6MTcxMDg1NDYwOX0.8Rlo_P_LivCwn_S-JK68ltQCbXPbUK3nXJKrhRYs7R8",
        "claims": {
            "sub": "au_65f98390d6a34550cdc651a1",
            "roles": [
                "admin"
            ],
            "iat": 1710851009,
            "exp": 1710854609
        }
    },
    "refresh_token": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdV82NWY5ODM5MGQ2YTM0NTUwY2RjNjUxYTEiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3MTA4NTEwMDksImV4cCI6MTcxMTQ1NTgwOSwiYXVkIjoiL3JlZnJlc2gifQ.WEwJtnEpfcQ6IHouQEnVeG5haWJTCw8hRmxqLMxHKM8",
        "claims": {
            "sub": "au_65f98390d6a34550cdc651a1",
            "roles": [
                "admin"
            ],
            "iat": 1710851009,
            "exp": 1711455809,
            "aud": "/refresh"
        }
    }
  };

  [
    { slug: '/auth/signup', schema: _signupTypeSchema, desc: 'Signup a user' },
    { slug: '/auth/signin', schema: _signinTypeSchema, desc: 'Signin a user' },
    { slug: '/auth/refresh', schema: _refreshTypeSchema, desc: 'Refresh a token' }
  ].forEach(
    it => {
      registry.registerPath({
        method: 'post',
        path: it.slug,
        description: it.desc,
        summary: it.desc,
        tags,
        request: {
          body: {
            content: {
              "application/json": {
                schema: it.schema,
              },
            },
          }
        },
        responses: {
          200: {
            description: 'auth info',
            content: {
              "application/json": {
                schema: apiAuthResultSchema,
                example
              },
            },
          },
        },
      });
    }
  )

  
}


/**
 * @param {OpenAPIRegistry} registry 
 */
const register_collections = registry => {
  const name = 'collection'
  const slug_base = 'collections'
  const tags = [`${name}s`];
  const example_id = 'col_65f2ae568bf30e6cd0ca95ea';
  const _typeSchema = registry.register(name, collectionTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, collectionTypeUpsertSchema);
  const example = {
    "active": true,
    "handle": "t-shirts-men",
    "title": "T Shirts for men",
    "tags": [
      "tag-summer",
      "tag-hello"
    ],
    "id": "col_65f2ae5a8bf30e6cd0ca95f4",
    "created_at": "2024-03-14T07:59:22.013Z",
    "updated_at": "2024-03-14T07:59:22.013Z",
    "search": [
      "tag:tag-summer",
      "tag:tag-hello",
      "handle:t-shirts-men",
      "t-shirts-men",
      "id:col_65f2ae5a8bf30e6cd0ca95f4",
      "col_65f2ae5a8bf30e6cd0ca95f4",
      "65f2ae5a8bf30e6cd0ca95f4",
      "active:true",
      "summer",
      "hello",
    ]
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_tags = registry => {
  const name = 'tag'
  const slug_base = 'tags'
  const tags = [slug_base];
  const example_id = 'tag_65f2ae568bf30e6cd0ca95ea';
  const _typeSchema = registry.register(name, tagTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, tagTypeUpsertSchema);
  const example = {
    "handle": "color",
    "values": [
      "white", 'red', 'black'
    ],
    "id": "tag_65f2ae568bf30e6cd0ca95ea",
    "created_at": "1970-01-01T00:00:00.002Z",
    "updated_at": "1970-01-01T00:00:00.002Z",
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_shipping = registry => {
  const name = 'shipping'
  const slug_base = name
  const tags = [slug_base];
  const example_id = 'ship_65dc6198c40344c9a1dd674f';
  const _typeSchema = registry.register(name, shippingMethodTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, shippingMethodTypeUpsertSchema);
  const example = {
    "handle": "shipping-express",
    "name": "Express Shipping 2-3 days",
    "price": 50,
    "id": "ship_65dc6198c40344c9a1dd674f",
    "search": [
      "handle:shipping-express",
      "shipping-express",
      "id:ship_65dc6198c40344c9a1dd674f",
      "ship_65dc6198c40344c9a1dd674f",
      "65dc6198c40344c9a1dd674f",
      "Express",
      "Shipping",
    ],
    "created_at": "2024-02-26T10:02:00.139Z",
    "updated_at": "2024-02-26T10:02:00.139Z"
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_customers = registry => {
  const name = 'customer'
  const slug_base = 'customers'
  const tags = [slug_base];
  const example_id = 'cus_65f2ae6e8bf30e6cd0ca95fa';
  const _typeSchema = registry.register(name, customerTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, customerTypeUpsertSchema);
  const example = {
    "email": "a1@a.com",
    "firstname": "name 1",
    "lastname": "last 1",
    "id": "cus_65f2ae6e8bf30e6cd0ca95fa",
    "created_at": "2024-03-14T07:59:42.862Z",
    "updated_at": "2024-03-14T07:59:42.862Z",
    "search": [
      "id:cus_65f2ae6e8bf30e6cd0ca95fa",
      "cus_65f2ae6e8bf30e6cd0ca95fa",
      "65f2ae6e8bf30e6cd0ca95fa",
      "name 1",
      "last 1",
      "a1@a.com"
    ]
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_auth_users = registry => {
  const name = 'auth_user'
  const slug_base = 'auth_users'
  const tags = [slug_base];
  const example_id = 'au_65f2ae588bf30e6cd0ca95f3';
  const _typeSchema = registry.register(name, authUserTypeSchema);
  const example = {
    "id": "au_65f2ae588bf30e6cd0ca95f3",
    "email": "admin@sc.com",
    "password": "djAxaUodw7NHExEjHkRLJ3RdwoTDigAAZMKXwrYkw7pCw6XClcOXBlU_wrXDh8KXw7PDuMKAWMOww5pIGsOsworDrUhlwoFbwrrCvsKw",
    "confirmed_mail": false,
    "roles": [
      "admin"
    ],
    "created_at": "2024-03-14T07:59:20.031Z",
    "updated_at": "2024-03-14T07:59:20.031Z",
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_discounts = registry => {
  const name = 'discount'
  const slug_base = 'discounts'
  const tags = [slug_base];
  const example_id = 'dis_65f2ae888bf30e6cd0ca9600';
  const _typeSchema = registry.register(name, discountTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, discountTypeUpsertSchema);
  const example = {
    "active": true,
    "handle": "10-off-for-product-1",
    "title": "10% OFF for product 1",
    "priority": 0,
    "application": {
      "id": 0,
      "name": "Automatic",
      "name2": "automatic"
    },
    "info": {
      "details": {
        "meta": {
          "id": 0,
          "type": "regular",
          "name": "Regular Discount"
        },
        "extra": {
          "fixed": 0,
          "percent": 10
        }
      },
      "filters": [
        {
          "meta": {
            "id": 2,
            "type": "product",
            "op": "p-in-handles",
            "name": "Product has ID"
          },
          "value": [
            "pr-api-discounts-products-test-js-1"
          ]
        }
      ]
    },
    "id": "dis_65f2ae888bf30e6cd0ca9600",
    "created_at": "2024-03-14T08:00:08.138Z",
    "updated_at": "2024-03-14T08:00:08.138Z",
    "search": [
      "handle:10-off-for-product-1",
      "10-off-for-product-1",
      "id:dis_65f2ae888bf30e6cd0ca9600",
      "dis_65f2ae888bf30e6cd0ca9600",
      "65f2ae888bf30e6cd0ca9600",
      "active:true",
      "10",
      "product",
      "1",
      "10% off for product 1",
      "app:0",
      "app:automatic",
      "type:0",
      "type:regular"
    ]
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_images = registry => {
  const name = 'image'
  const slug_base = 'images'
  const tags = [slug_base];
  const example_id = 'img_65f2ae8d8bf30e6cd0ca9603';
  const _typeSchema = registry.register(name, imageTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, imageTypeUpsertSchema);
  const example = {
    "handle": "a2-png",
    "name": "a2.png",
    "url": "https://host.com/folder/a2.png",
    "id": "img_65f2ae8d8bf30e6cd0ca9603",
    "created_at": "2024-03-14T08:00:14.335Z",
    "updated_at": "2024-03-14T08:00:14.335Z",
    "search": [
      "handle:a2-png",
      "a2-png",
      "id:img_65f2ae8d8bf30e6cd0ca9603",
      "img_65f2ae8d8bf30e6cd0ca9603",
      "65f2ae8d8bf30e6cd0ca9603",
      "a2",
      "png",
      "a2.png"
    ]
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_notifications = registry => {
  const name = 'notification'
  const slug_base = 'notifications'
  const tags = [slug_base];
  const example_id = 'not_65f2ae998bf30e6cd0ca9605';
  const _typeSchema = registry.register(name, notificationTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, notificationTypeUpsertSchema);
  const example = {
    "message": "message 1",
    "search": [
      "checkout",
      "backend",
      "author:backend-bot"
    ],
    "author": "backend-bot",
    "actions": [
      {
        "type": "url",
        "name": "name",
        "params": {
          "url": "https://storecraft.com"
        }
      }
    ],
    "id": "not_65f2ae998bf30e6cd0ca9605",
    "created_at": "2024-03-14T08:00:25.859Z",
    "updated_at": "2024-03-14T08:00:25.859Z"
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_orders = registry => {
  const name = 'order'
  const slug_base = 'orders'
  const tags = [slug_base];
  const example_id = 'order_65f2ae998bf30e6cd0ca9605';
  const _typeSchema = registry.register(name, orderDataSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, orderDataUpsertSchema);
  const example = {
    "status": {
      "checkout": {
        "id": 0,
        "name2": "created",
        "name": "Created"
      },
      "payment": {
        "id": 1,
        "name": "Authorized",
        "name2": "authorized"
      },
      "fulfillment": {
        "id": 0,
        "name2": "draft",
        "name": "Draft"
      }
    },
    "pricing": {
      "quantity_discounted": 3,
      "quantity_total": 5,
      "subtotal": 100,
      "subtotal_discount": 30,
      "subtotal_undiscounted": 70,
      "total": 120
    },
    "line_items": [
      {
        "id": "pr-1-id",
        "qty": 3
      },
      {
        "id": "pr-2-id",
        "qty": 2
      }
    ],
    "shipping_method": {
      "handle": "ship-a",
      "name": "ship a",
      "price": 30
    },
    "id": "order_65d774c6445e4581b9e34c11",
    "search": [
      "id:order_65d774c6445e4581b9e34c11",
      "order_65d774c6445e4581b9e34c11",
      "65d774c6445e4581b9e34c11",
      "order_65d774c6445e4581b9e34c11",
      120,
      "payment:authorized",
      "payment:1",
      "fulfill:draft",
      "fulfill:0",
      "checkout:created",
      "checkout:0",
      "li:pr-1-id",
      "li:pr-2-id"
    ],
    "created_at": "2024-02-22T16:22:30.095Z",
    "updated_at": "2024-02-22T16:22:30.095Z"
  }
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_posts = registry => {
  const name = 'post'
  const slug_base = 'posts'
  const tags = [slug_base];
  const example_id = 'post_65f2ae998bf30e6cd0ca9605';
  const _typeSchema = registry.register(name, postTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, postTypeUpsertSchema);
  const example = {
    "handle": "post-1",
    "title": "post 1",
    "text": "text of post 1",
    "id": "post_65f2aea48bf30e6cd0ca9610",
    "created_at": "2024-03-14T08:00:36.999Z",
    "updated_at": "2024-03-14T08:00:36.999Z",
    "search": [
      "handle:post-1",
      "post-1",
      "id:post_65f2aea48bf30e6cd0ca9610",
      "post_65f2aea48bf30e6cd0ca9610",
      "65f2aea48bf30e6cd0ca9610",
      "post",
      "1",
      "post 1"
    ]
  }

  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_storefronts = registry => {
  const name = 'storefront'
  const slug_base = 'storefronts'
  const tags = [slug_base];
  const example_id = 'sf_65dc619ac40344c9a1dd6755';
  const _typeSchema = registry.register(name, storefrontTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, storefrontTypeUpsertSchema);
  const example = {
    "handle": "sf-1",
    "title": "sf 1",
    "id": "sf_65dc619ac40344c9a1dd6755",
    "search": [
      "handle:sf-1",
      "sf-1",
      "id:sf_65dc619ac40344c9a1dd6755",
      "sf_65dc619ac40344c9a1dd6755",
      "65dc619ac40344c9a1dd6755",
      "sf",
      "1",
      "sf 1"
    ],
    "created_at": "2024-02-26T10:02:02.469Z",
    "updated_at": "2024-02-26T10:02:03.036Z",
    "products": [
      {
        "handle": "pr-2",
        "active": true,
        "price": 150,
        "qty": 2,
        "title": "product 2",
        "id": "pr_65dc6197c40344c9a1dd674e",
        "search": [
          "handle:pr-2",
          "pr-2",
          "id:pr_65dc6197c40344c9a1dd674e",
          "pr_65dc6197c40344c9a1dd674e",
          "65dc6197c40344c9a1dd674e",
          "active:true",
          "product",
          "2",
          "product 2",
          "discount:3-for-100",
          "discount:dis_65db0b1bc99783b977504d43"
        ],
        "created_at": "2024-02-26T10:01:59.284Z",
        "updated_at": "2024-02-26T10:01:59.284Z"
      }
    ],
    "collections": [],
    "discounts": [
      {
        "active": false,
        "application": {
          "id": 0,
          "name": "Automatic",
          "name2": "automatic"
        },
        "handle": "fake-discount-2",
        "priority": 0,
        "title": "Fake Discount 2",
        "info": {
          "details": {
            "meta": {
              "id": 1,
              "type": "bulk",
              "name": "Bulk Discount"
            },
            "extra": {
              "qty": 3,
              "fixed": 100,
              "percent": 100
            }
          },
          "filters": [
            {
              "meta": {
                "id": 2,
                "type": "product",
                "op": "p-in-handles",
                "name": "Product has ID"
              },
              "value": [
                "pr-non-existing-handle"
              ]
            }
          ]
        },
        "id": "dis_65dc6199c40344c9a1dd6753",
        "search": [
          "handle:fake-discount-2",
          "fake-discount-2",
          "id:dis_65dc6199c40344c9a1dd6753",
          "dis_65dc6199c40344c9a1dd6753",
          "65dc6199c40344c9a1dd6753",
          "active:false",
          "fake",
          "discount",
          "2",
          "fake discount 2",
          "app:0",
          "app:automatic",
          "type:1",
          "type:bulk"
        ],
        "created_at": "2024-02-26T10:02:01.605Z",
        "updated_at": "2024-02-26T10:02:01.605Z"
      }
    ],
    "shipping_methods": [
      {
        "handle": "ship-2",
        "name": "ship 2",
        "price": 50,
        "id": "ship_65dc6198c40344c9a1dd674f",
        "search": [
          "handle:ship-2",
          "ship-2",
          "id:ship_65dc6198c40344c9a1dd674f",
          "ship_65dc6198c40344c9a1dd674f",
          "65dc6198c40344c9a1dd674f",
          "ship",
          "2",
          "ship 2"
        ],
        "created_at": "2024-02-26T10:02:00.139Z",
        "updated_at": "2024-02-26T10:02:00.139Z"
      }
    ],
    "posts": [
      {
        "handle": "post-2",
        "title": "post 2",
        "text": "blah blah 2",
        "id": "post_65dc6198c40344c9a1dd6751",
        "search": [
          "handle:post-2",
          "post-2",
          "id:post_65dc6198c40344c9a1dd6751",
          "post_65dc6198c40344c9a1dd6751",
          "65dc6198c40344c9a1dd6751",
          "post",
          "2",
          "post 2"
        ],
        "created_at": "2024-02-26T10:02:00.845Z",
        "updated_at": "2024-02-26T10:02:00.845Z"
      }
    ]
  }

  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_products = registry => {
  const name = 'product'
  const slug_base = 'products'
  const tags = [slug_base];
  const example_id = 'pr_65f2ae998bf30e6cd0ca9605';
  const _typeSchema = registry.register(name, productTypeSchema.or(variantTypeSchema));
  const _typeUpsertSchema = registry.register(`${name}Upsert`, productTypeUpsertSchema.or(variantTypeUpsertSchema));
  const example = {
    "handle": "pr-api-discounts-products-test-js-1",
    "active": true,
    "price": 50,
    "qty": 1,
    "title": "product 1",
    "id": "pr_65f2ae878bf30e6cd0ca95ff",
    "created_at": "2024-03-14T08:00:07.297Z",
    "updated_at": "2024-03-14T08:00:07.297Z",
    "discounts": [
      {
        "active": true,
        "handle": "10-off-for-specific",
        "priority": 0,
        "title": "10% OFF for specific product",
        "application": {
          "id": 0,
          "name": "Automatic",
          "name2": "automatic"
        },
        "info": {
          "details": {
            "meta": {
              "id": 0,
              "type": "regular",
              "name": "Regular Discount"
            },
            "extra": {
              "fixed": 0,
              "percent": 10
            }
          },
          "filters": [
            {
              "meta": {
                "id": 2,
                "type": "product",
                "op": "p-in-handles",
                "name": "Product has ID"
              },
              "value": [
                "pr-api-discounts-products-test-js-1"
              ]
            }
          ]
        },
        "id": "dis_65e75bbb3e40cc70cb17d131",
        "search": [
          "handle:10-off-for-specific",
          "10-off-for-specific",
          "id:dis_65e75bbb3e40cc70cb17d131",
          "dis_65e75bbb3e40cc70cb17d131",
          "65e75bbb3e40cc70cb17d131",
          "active:true",
          "10",
          "specific",
          "product",
          "10% off for specific product",
          "app:0",
          "app:automatic",
          "type:0",
          "type:regular"
        ],
        "created_at": "2024-03-05T17:51:55.828Z",
        "updated_at": "2024-03-05T17:51:55.828Z"
      },
      {
        "active": true,
        "handle": "3-for-100",
        "priority": 0,
        "title": "Buy 3 for 100",
        "application": {
          "id": 0,
          "name": "Automatic",
          "name2": "automatic"
        },
        "info": {
          "details": {
            "meta": {
              "id": 1,
              "type": "bulk",
              "name": "Bulk Discount"
            },
            "extra": {
              "qty": 3,
              "fixed": 100,
              "percent": 100
            }
          },
          "filters": [
            {
              "meta": {
                "id": 6,
                "type": "product",
                "op": "p-all",
                "name": "All Products"
              }
            }
          ]
        },
        "id": "dis_65f2ae768bf30e6cd0ca95fc",
        "created_at": "2024-03-14T07:59:50.908Z",
        "updated_at": "2024-03-14T07:59:50.908Z",
        "search": [
          "handle:3-for-100",
          "3-for-100",
          "id:dis_65f2ae768bf30e6cd0ca95fc",
          "dis_65f2ae768bf30e6cd0ca95fc",
          "65f2ae768bf30e6cd0ca95fc",
          "active:true",
          "buy",
          "3",
          "100",
          "buy 3 for 100",
          "app:0",
          "app:automatic",
          "type:1",
          "type:bulk"
        ]
      }
    ],
    "search": [
      "handle:pr-api-discounts-products-test-js-1",
      "pr-api-discounts-products-test-js-1",
      "id:pr_65f2ae878bf30e6cd0ca95ff",
      "pr_65f2ae878bf30e6cd0ca95ff",
      "65f2ae878bf30e6cd0ca95ff",
      "active:true",
      "product",
      "1",
      "product 1",
      "discount:10-off-for-specific",
      "discount:3-for-100",
      "discount:dis_65e75bbb3e40cc70cb17d131",
      "discount:dis_65f2ae768bf30e6cd0ca95fc",
    ]
  }

  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}



//

create_all();