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
  checkoutStatusEnumSchema,
  collectionTypeSchema,
  collectionTypeUpsertSchema,
  customerTypeSchema,
  customerTypeUpsertSchema,
  discountApplicationEnumSchema,
  discountMetaEnumSchema,
  discountTypeSchema,
  discountTypeUpsertSchema,
  errorSchema,
  filterMetaEnumSchema,
  fulfillOptionsEnumSchema,
  imageTypeSchema,
  imageTypeUpsertSchema,
  notificationTypeSchema,
  notificationTypeUpsertSchema,
  orderDataSchema,
  orderDataUpsertSchema,
  paymentOptionsEnumSchema,
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
  const cursor = z.string().optional().openapi(
    { 
      examples: [
        '(updated_at:2024-01-24T20:28:24.126Z, id:tag_65b172ebc4c9552fd46c1027)',
      ],
      description: 'A cursor in CSV format of key and values, example: \
      `(updated_at:2024-01-24T20:28:24.126Z, id:tag_65b172ebc4c9552fd46c1027)`'
    }
  );

  return z.object({
    limit: z.number().optional().openapi(
      { 
        example: 10, default: 10, 
        description: 'Limit of filtered results' 
      }
    ),
    limitToLast: z.number().optional().openapi(
      { 
        example: 10,
        description: 'Limit filtered results from the end of a query range' 
      }
    ),
    startAt: cursor,
    startAfter: cursor,
    endAt: cursor,
    endBefore: cursor,
    sortBy: z.string().optional().openapi(
      { 
        examples: ['(updated_at, id)'],
        description: 'A cursor of Keys in CSV format, example: `(updated_at, id)`',
        default: '`(updated_at, id)`'
      }
    ),
    order: z.enum(['asc', 'desc']).optional().openapi(
      { 
        examples: ['asc', 'desc'],
        description: 'Order of sort cursor, values are `asc` or `desc`',
        default: 'desc'
      }
    ),
    vql: z.string().optional().openapi(
      { 
        examples: ["(term1 & (term2 | -term3))"],
        description: 'Every item has a recorded search terms which you can use \
        to refine your filtering with `VQL` boolean language, example: "term1 & (term2 | -term3)"'
      }
    ),
    expand: z.string().optional().openapi(
      {
        examples: ['*', 'search', 'search, collections'],
        description: 'A **CSV** of keys of connections to expand, example \
        `(search, discounts, collections, *)`',
        default: '(*)'
      }
    )
  });
}

const create_all = () => {
  const registry = new OpenAPIRegistry();
  const bearerAuth = registry.registerComponent(
    'securitySchemes',
    'bearerAuth',
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }
  );

  // register routes
  register_auth(registry);
  register_storage(registry);
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

  // register some utility types
  registry.register('Error', errorSchema);
  registry.register('CheckoutStatusEnum', checkoutStatusEnumSchema);
  registry.register('PaymentOptionsEnum', paymentOptionsEnumSchema);
  registry.register('FulfillOptionsEnum', fulfillOptionsEnumSchema);
  registry.register('FilterMetaEnum', filterMetaEnumSchema);
  registry.register('DiscountMetaEnum', discountMetaEnumSchema);
  registry.register('DiscountApplication', discountApplicationEnumSchema);
  // generate
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const out = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'StoreCraft API',
      description: 'Welcome to the `StoreCraft` **API**',
    },
    servers: [{ url: 'api' }],
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
 * @param {string} [aug_description] 
 * @param {any} [extra] 
 */
const register_base_get = (
  registry, slug_base, name, tags, example_id, zod_schema, 
  example, aug_description='', extra={}
  ) => {

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}?expand={expand}`,
    description: `Get ${name} data by its \`id\` or \`handle\` \n${aug_description}`,
    summary: `Get a single ${name}`,
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: `The \`id\` or \`handle\` of ${name}`
          }
        ),
      }),
      query: z.object({
        expand: z.string().openapi(
          { 
            examples: [`(collections, search)`, `*`],
            description: `Expand connections of item, 
            a **CSV** of connection names, example \`(search, discounts)\` (Use \`*\` for all)`,
            default: '`*`'
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
      ...error() 
    },
    ...extra
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
 * @param {string} [description] 
 * @param {string} [summary] 
 */
const register_base_upsert = (registry, slug_base, name, tags, example_id, 
  zod_schema, example, description, summary) => {
  example = {...example};

  delete example['search'];
  
  registry.registerPath({
    method: 'post',
    path: `/${slug_base}`,
    description: description ?? `Upsert a \`${name}\``,
    summary: summary ?? `Upsert a single ${name}`,
    tags,
    request: {
      body: {
        content: {
          "application/json": {
            schema: zod_schema,
            example
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
      ...error() 
    },
    security: [{ bearerAuth: [] }]
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {string} [description] 
 */
const register_base_delete = (registry, slug_base, name, tags, description) => {
  
  registry.registerPath({
    method: 'delete',
    path: `/${slug_base}/{id_or_handle}`,
    description: description ?? `Delete a \`${name}\``,
    summary: `Delete a single ${name}`,
    tags,
    request: {
    },
    responses: {
      200: {
        description: 'Item was deleted',
      },
      ...error() 
    },
    security: [{ bearerAuth: [] }]
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {ZodSchema} zod_schema 
 * @param {z.infer<typeof zod_schema>} example 
 * @param {any} [extra] 
 * @param {string} [aug_description] 
 */
const register_base_list = (
  registry, slug_base, name, tags, zod_schema, example, extra={}, aug_description='') => {
  
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}?limit={limit}&startAt={startAt}&endAt={endAt}
      &startAfter={startAfter}&endBefore={endBefore}&sortBy={sortBy}
      &order={order}&vql={vql}&expand={expand}`,
    summary: `List and filter ${name} items`,
    description: `List and filter items \n ${aug_description}`,
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
      ...error() 
    },
    ...extra
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
          ...error() 
        },
      });
    }
  )
}

const error = () => {
  return {
    '400-500': {
      description: 'error',
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    }
  }
}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_storage = registry => {
  const tags = ['storage'];
  const security = [ { bearerAuth: [] } ];
  const zod_presigned = z.object(
    {
      url: z.string().openapi({ description: 'The request url to follow' }),
      method: z.enum(['GET', 'POST', 'PUT']).openapi({ description: 'The request method' }),
      headers: z.record(z.string()).optional().openapi({ description: 'Additional request headers'}),
    }
  )

  const PresignedUrl = registry.register('PresignedUrl', zod_presigned).openapi(
    {
      description: '`presigned` urls endpoints generate a description of `http` request \
      that a client can assemble and use it\'s own resources and network to execute to perform\
      image download or upload. This is highly recommended'
    }
  );

  const query = z.object(
    {
      signed: z.boolean().optional().openapi(
        { 
          example: true, default: true, 
          description: 'Prefer signed url if supported' 
        }
      )
    }
  );

  // download (no presigned url)
  registry.registerPath({
    security,
    method: 'get',
    path: '/storage/{file_key}?signed=false',
    description: 'Download a file directly from the backend, \
    this is discouraged if you are using \
    a storage provider, that supports `presigned` urls creation, \
    which you can delegate to the client and use it\'s resources \
    and network for download',
    summary: 'Download file (directly)',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: `images/test.png`
          }
        ),
      }),
      query
    },
    responses: {
      200: {
        description: 'bytearray',
        content: {
          "image/*": {
            schema: z.any(),
          },
        },
      },
      ...error() 
    },
  });

  // download (presigned url)
  registry.registerPath({
    security,
    method: 'get',
    path: '/storage/{file_key}?signed=true',
    description: 'Cloud storage providers allow the creation of Presigned links, \
    so frontend can download directly, this is recommended. The response returned is a \
    request description, that you should create. i.e, `url`, `method`, `headers`',
    summary: 'Download file (presigned url)',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: `images/test.png`
          }
        ),
      }),
      query

    },
    responses: {
      200: {
        description: 'A `http` request instruction, that you should execute',
        content: {
          "application/json": {
            schema: PresignedUrl,
            example: {
              "url": "https://storage.googleapis.com/shelf-demo-da5fd.appspot.com/a111.png?GoogleAccessId=firebase-adminsdk-izooa%40shelf-demo-da5fd.iam.gserviceaccount.com&Expires=1710878150&Signature=XQttB9RJbIQalNoHENZenlq9LEIVf3jKU4zdJJEXLO1cdnjZ8CqRUgM4exbh5nclakrGA7waNwfHpaaAAs5nUnUPhoDBYv7y8wcDMK%2BJL9%2F4uNSSAX4TutudLZ1EMQ4CoGTfPCPXnoTPcGjOm2L5TPB6PeTeWgq%2BUiPZ%2FoMrDDHe8Xjy0WCuAJQo6LPWQtdcnRsLedJB77K8NYxjWzxqNgrhft08d3YjugFDAvDcCz7hOgA8mXBAinKH6JvBQhjRgQaUCCIQr0qJPyroX7rfgxBKCFs0jJjdtVlwDCm535BOENWCI5bgcxSy4yUu9b%2BI59v%2B8Zg74ANAFGIQq0zXdA%3D%3D",
              "method": "GET"
            }
          },
        },
      },
      ...error() 
    },
  });  

  // upload (no presigned url)
  registry.registerPath({
    security,
    method: 'put',
    path: '/storage/{file_key}?signed=false',
    description: 'Upload a file directly into the backend, this is discouraged, we do encourage to use `presigned` url variant',
    summary: 'Upload a file (directly)',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: `images/test.png`,
            description: 'The file key'
          }
        ),
      }),
      body: {
        content: {
          '*/*': { schema: z.any().openapi({ description: 'Body is any `blob` / `bytearray` stream' }) },
          
        },
      },
      query

    },
    responses: {
      200: {
        description: 'success'
      },
      ...error() 
    },
  });

  // upload (presigned url)
  registry.registerPath({
    security,
    method: 'put',
    path: '/storage/{file_key}?signed=true',
    description: 'Upload a file indirectly into the backend, most cloud storages allow this feature',
    summary: 'Upload a file (presigned url)',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: `images/test.png`,
            description: 'The file key'
          }
        ),
      }),
      query
    },
    responses: {
      200: {
        description: 'A `http` request instruction, that you should execute',
        content: {
          "application/json": {
            schema: PresignedUrl,
            example: {
              "url": "https://storage.googleapis.com/shelf-demo-da5fd.appspot.com/a111.png?GoogleAccessId=firebase-adminsdk-izooa%40shelf-demo-da5fd.iam.gserviceaccount.com&Expires=1710879955&Signature=Wi5Di1f55k%2FWt9yULSHmyZpYpgBW3VTw9ZqlityFrI%2BgKehA%2FEptAHb%2FoWEWblv5Pd9RDGhFl9PoNaV6j%2B8dl4qdJkTJNWufXhYRmTirxsuXZlPYV25lMPPZ6HBaurg1Cjgd0V87FASsXTshnpC514MUH%2BioDCxksdybTEu%2BRSG27KqlGfY1CXEheBUncSmY6%2BURVhZhhRGLc2f7sfTlVpwq5d4HHSk%2FkLHflUPMUQioEYOD6EwKd8FBLdciA%2FQjDK3AcpmRrQslR5f524V8AfFdWRsRMqE%2BBFcYR4FimHkjuQPo4HedfQ5uSwnWi4g9TugWpIwVVNgfbQoN9wJOzQ%3D%3D",
              "method": "PUT",
              "headers": {
                  "Content-Type": "image/png"
              }
            }

          },
        },
      },
      ...error() 
    },
  });

  // delete
  registry.registerPath({
    security,
    method: 'delete',
    path: '/storage/{file_key}',
    description: 'Delete a file',
    summary: 'Delete a file',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: `images/test.png`,
            description: 'The file key'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: 'success',
      },
      ...error() 
    },
  });  
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
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, collectionTypeUpsertSchema
    );
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

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example
    );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeUpsertSchema, example
    );
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(
    registry, slug_base, name, tags, _typeUpsertSchema, 
    example
    );

  // list and filter collection products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products`,
    description: 'Each `collection` is linked to `products`, you can query and filter these `products` by collection',
    summary: 'List and filter collection\'s products',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle`'
          }
        ),
      }),
      query: create_query()
    },
    responses: {
      200: {
        description: `Filtered product\'s of a collection`,
        content: {
          'application/json': {
            schema: z.array(variantTypeSchema),
            example: [
              {
                "handle": "tshirt-red-color",
                "active": true,
                "price": 50,
                "qty": 1,
                "title": "tshirt variant 1 - red color",
                "parent_handle": "pr-api-products-variants-test-js-1",
                "parent_id": "pr_65e5ca42c43e2c41ae5216a9",
                "variant_hint": [
                  {
                    "option_id": "id-option-1",
                    "value_id": "id-val-1"
                  }
                ],
                "id": "pr_65fab4471d764999c957cb05",
                "created_at": "2024-03-20T10:02:47.411Z",
                "updated_at": "2024-03-20T10:02:47.411Z",
                "search": [
                  "handle:tshirt-red-color",
                  "tshirt-red-color",
                  "id:pr_65fab4471d764999c957cb05",
                  "pr_65fab4471d764999c957cb05",
                  "65fab4471d764999c957cb05",
                  "active:true",
                  "tshirt",
                  "variant",
                  "1",
                  "red",
                  "color",
                  "tshirt variant 1 - red color",
                  "discount:3-for-100",
                ]
              }
            ]
          },
        },
      },
      ...error() 
    },
  });

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
  const _typeSchema = registry.register(
    name, customerTypeSchema
    );
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, customerTypeUpsertSchema
    );
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
  const security = [ { bearerAuth: [] } ];

  register_base_get(
    registry, slug_base, name, tags, example_id,
    _typeSchema, example, '', { security }
    );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeUpsertSchema, example
    );

  const desc_delete = `When removing a \`customer\`, the 
  following side effects will happen:\n 
  - Referenced \`auth_user\` will be removed as well \n 
  `

  register_base_delete(registry, slug_base, name, tags, desc_delete);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example, { security }
    );
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
  const security = [ { bearerAuth: [] } ];

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example, '', { security } );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example
    );
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(
    registry, slug_base, name, tags, _typeSchema, example, { security });
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
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, discountTypeUpsertSchema
    );
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
  
  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example
    );

  const desc_upsert = `When upserting a \`discount\`, 
  the following side effects will happen:\n 
  - \`Products\` will be inspected and updated with eligibility 
  to the \`discount\` if they meet criterions \n
  `

  register_base_upsert(registry, slug_base, name, tags, 
    example_id, _typeUpsertSchema, example, desc_upsert);
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(registry, slug_base, name, tags, 
    _typeUpsertSchema, example);

  // list and filter discount's products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products`,
    description: 'Each `discount` has eligible `products`, \
      you can query and filter these `products` by discount',
    summary: 'List and filter discount\'s eligible products',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle`'
          }
        ),
      }),
      query: create_query()
    },
    responses: {
      200: {
        description: `Filtered product\'s of a discount`,
        content: {
          'application/json': {
            schema: z.array(variantTypeSchema),
            example: [
              {
                "handle": "tshirt-red-color",
                "active": true,
                "price": 50,
                "qty": 1,
                "title": "tshirt variant 1 - red color",
                "parent_handle": "pr-api-products-variants-test-js-1",
                "parent_id": "pr_65e5ca42c43e2c41ae5216a9",
                "variant_hint": [
                  {
                    "option_id": "id-option-1",
                    "value_id": "id-val-1"
                  }
                ],
                "id": "pr_65fab4471d764999c957cb05",
                "created_at": "2024-03-20T10:02:47.411Z",
                "updated_at": "2024-03-20T10:02:47.411Z",
                "search": [
                  "handle:tshirt-red-color",
                  "tshirt-red-color",
                  "id:pr_65fab4471d764999c957cb05",
                  "pr_65fab4471d764999c957cb05",
                  "65fab4471d764999c957cb05",
                  "active:true",
                  "tshirt",
                  "variant",
                  "1",
                  "red",
                  "color",
                  "tshirt variant 1 - red color",
                  "discount:3-for-100",
                ]
              }
            ]
          },
        },
      },
      ...error() 
    },
  });

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
  const example = [
    {
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
  ];
  const security = [ { bearerAuth: [] } ];

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example, '', { security }
  );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    z.array(_typeUpsertSchema), example, 
    'Upsert Bulk `notifications`', 'Upsert Bulk notifications');
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example, { security }
    );
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
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, orderDataUpsertSchema
    );
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
  const security = [ { bearerAuth: [] } ];

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example);
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeUpsertSchema, example
    );
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example, { security },
    'List operates differently in the following cases: \n \
    - If user is `admin`, orders of all customers will be returned \n \
    - If user is not `admin`, then only his own orders will be returned '
    );
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
  const _typeSchema = registry.register(
    name, storefrontTypeSchema
    );
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, storefrontTypeUpsertSchema
    );
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

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example,
    `- Eligible  expand connection are \`('collections, 
    products, discounts, posts, shipping, search')\``
    );

  const desc_upsert = 'When upserting a `storefront`, the \
  following side effects will happen:\n \
  - `collections` field will be used to form connections with `collections` \n \
  - `products` field will be used to form connections with `products` \n \
  - `discounts` field will be used to form connections with `discounts` \n \
  - `shipping_methods` field will be used to form connections with `shipping` \n \
  - `posts` field will be used to form connections with `posts` \n \
  '

  register_base_upsert(registry, slug_base, name, tags, 
    example_id, _typeUpsertSchema, example, desc_upsert
    );
  register_base_delete(registry, slug_base, name, tags);
  register_base_list(
    registry, slug_base, name, tags, _typeUpsertSchema, example
    );

  // list linked products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products`,
    description: 'Each `storefront` has linked products, you can list these `products`',
    summary: 'List storefront products',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle` of the storefront'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of products`,
        content: {
          'application/json': {
            schema: z.array(productTypeSchema.or(variantTypeSchema)),
            example: [
              {
                "handle": "pr-api-discounts-products-test-js-1",
                "active": true,
                "price": 50,
                "qty": 1,
                "title": "product 1",
                "id": "pr_65f2ae878bf30e6cd0ca95ff",
                "created_at": "2024-03-14T08:00:07.297Z",
                "updated_at": "2024-03-14T08:00:07.297Z",
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
            ]
          },
        },
      },
      ...error() 
    },
  });

  // list linked discounts
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/discounts`,
    description: 'Each `storefront` has linked discounts, you can list these `discounts`',
    summary: 'List storefront discounts',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle` of the storefront'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of discounts`,
        content: {
          'application/json': {
            schema: z.array(discountTypeSchema),
            example: [
              {
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
            ]
          },
        },
      },
      ...error() 
    },
  });

  // list linked shipping methods
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/shipping`,
    description: 'Each `storefront` has linked shipping methods, you can list these `shipping methods`',
    summary: 'List storefront shipping methods',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle` of the storefront'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of shipping methods`,
        content: {
          'application/json': {
            schema: z.array(shippingMethodTypeSchema),
            example: [
              {
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
            ]
          },
        },
      },
      ...error() 
    },
  });
  
  // list linked collections
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/collections`,
    description: 'Each `storefront` has linked collections, you can list these `collections`',
    summary: 'List storefront collections',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle` of the storefront'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of collections`,
        content: {
          'application/json': {
            schema: z.array(collectionTypeSchema),
            example: [
              {
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
            ]
          },
        },
      },
      ...error() 
    },
  });

  // list linked posts
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/posts`,
    description: 'Each `storefront` has linked posts, you can list these `posts`',
    summary: 'List storefront posts',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle` of the storefront'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of posts`,
        content: {
          'application/json': {
            schema: z.array(postTypeSchema),
            example: [
              {
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
            ]
          },
        },
      },
      ...error() 
    },
  });

}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_products = registry => {
  const name = 'product'
  const slug_base = 'products'
  const tags = [slug_base];
  const example_id = 'pr_65f2ae998bf30e6cd0ca9605';
  const _typeSchema = registry.register(
    name, productTypeSchema.or(variantTypeSchema)
    );
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, productTypeUpsertSchema.or(variantTypeUpsertSchema)
    );
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

  const desc_upsert = `When upserting a \`product\`, 
  the following side effects will happen:\n 
  - \`collections\` field will be used to form connections with \`collections\` \n 
  - It will form connections with eligible product \`discounts\` \n 
  - If it is a \`variant\`, it will be connected to it\'s parent \n  
  `
  register_base_get(
    registry, slug_base, name, tags, example_id,
    _typeSchema, example, 
    `- Eligible  expand connection are \`('collections, 
    search, variants, discounts')\``
    );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeUpsertSchema, example, desc_upsert
    );

  // upsert a variant

  registry.registerPath({
    method: 'post',
    path: `/${slug_base}/`,
    summary: `Upsert a single variant`,
    description: 'Upsert a `variant`, a `variant` is a regular \
    product with the following fields set `parent_id`, `parent_handle`, `variant_hint`',
    tags,
    request: {
      body: {
        content: {
          "application/json": {
            schema: variantTypeUpsertSchema,
            example: {
              "handle": "tshirt-red-color",
              "active": true,
              "price": 50,
              "qty": 1,
              "title": "tshirt variant 1 - red color",
              "parent_handle": "tshirt",
              "parent_id": "pr_65e5ca42c43e2c41ae5216a9",
              "variant_hint": [
                {
                  "option_id": "id-option-1",
                  "value_id": "id-val-1"
                }
              ],
              "id": "pr_65fab4471d764999c957cb05",
              "created_at": "2024-03-20T10:02:47.411Z",
              "updated_at": "2024-03-20T10:02:47.411Z",
              "search": [
                "handle:tshirt-red-color",
                "tshirt-red-color",
                "id:pr_65fab4471d764999c957cb05",
                "pr_65fab4471d764999c957cb05",
                "65fab4471d764999c957cb05",
                "active:true",
                "tshirt",
                "variant",
                "1",
                "red",
                "color",
                "tshirt variant 1 - red color",
                "discount:3-for-100",
              ]
            }
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
      ...error() 
    },
  });

  register_base_delete(registry, slug_base, name, tags);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example
    );

  // list collections
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/collections`,
    description: 'Each `products` has linked collections, you can list all these `collections`',
    summary: 'List all product\'s collections',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle`'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List all product\'s collections`,
        content: {
          'application/json': {
            schema: z.array(collectionTypeSchema),
            example: [
              {
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
            ]
          },
        },
      },
      ...error() 
    },
  });

  // list variants
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/variants`,
    description: 'Each `products` may have linked product variants, you can list all these `variants`',
    summary: 'List all product\'s variants',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle`'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List all product\'s variants`,
        content: {
          'application/json': {
            schema: z.array(variantTypeSchema),
            example: [
              {
                "handle": "tshirt-red-color",
                "active": true,
                "price": 50,
                "qty": 1,
                "title": "tshirt variant 1 - red color",
                "parent_handle": "pr-api-products-variants-test-js-1",
                "parent_id": "pr_65e5ca42c43e2c41ae5216a9",
                "variant_hint": [
                  {
                    "option_id": "id-option-1",
                    "value_id": "id-val-1"
                  }
                ],
                "id": "pr_65fab4471d764999c957cb05",
                "created_at": "2024-03-20T10:02:47.411Z",
                "updated_at": "2024-03-20T10:02:47.411Z",
                "search": [
                  "handle:tshirt-red-color",
                  "tshirt-red-color",
                  "id:pr_65fab4471d764999c957cb05",
                  "pr_65fab4471d764999c957cb05",
                  "65fab4471d764999c957cb05",
                  "active:true",
                  "tshirt",
                  "variant",
                  "1",
                  "red",
                  "color",
                  "tshirt variant 1 - red color",
                  "discount:3-for-100",
                ]
              }
            ]
          },
        },
      },
      ...error() 
    },
  });

  // list discounts
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/discounts`,
    description: 'Each `products` may have linked `discounts`, you can list all these `discounts`',
    summary: 'List all product\'s discounts',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: `\`${example_id}\` or a \`handle\``,
            description: '`id` or `handle`'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List all product\'s discounts`,
        content: {
          'application/json': {
            schema: z.array(discountTypeSchema),
            example: [
              {
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
            ]
          },
        },
      },
      ...error() 
     },
  });

}

//

create_all();