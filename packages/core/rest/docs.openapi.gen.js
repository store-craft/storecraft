import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ZodSchema, z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { stringify as YAMLStringify } from 'yaml'
import {
  apiAuthChangePasswordTypeSchema,
  apiAuthRefreshTypeSchema,
  apiAuthResultSchema,
  apiAuthSigninTypeSchema,
  apiAuthSignupTypeSchema,
  apiKeyResultSchema,
  authUserTypeSchema,
  checkoutCreateTypeSchema,
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
  extensionItemGetSchema,
  filterMetaEnumSchema,
  fulfillOptionsEnumSchema,
  imageTypeSchema,
  imageTypeUpsertSchema,
  notificationTypeSchema,
  notificationTypeUpsertSchema,
  oAuthProviderCreateURIParamsSchema,
  oAuthProviderCreateURIResponseSchema,
  oAuthProviderSchema,
  orderDataSchema,
  orderDataUpsertSchema,
  ordersStatisticsTypeSchema,
  paymentGatewayItemGetSchema,
  paymentGatewayStatusSchema,
  paymentOptionsEnumSchema,
  postTypeSchema,
  postTypeUpsertSchema,
  pricingDataSchema,
  productTypeSchema,
  productTypeUpsertSchema,
  quickSearchResourceSchema,
  quickSearchResultSchema,
  shippingMethodTypeSchema,
  shippingMethodTypeUpsertSchema,
  signWithOAuthProviderParamsSchema,
  similaritySearchResultSchema,
  storecraftConfigSchema,
  storefrontTypeSchema,
  storefrontTypeUpsertSchema,
  tagTypeSchema, tagTypeUpsertSchema,
  variantTypeSchema,
  variantTypeUpsertSchema
} from '../api/types.autogen.zod.api.js'
import * as path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from "node:url";
import { count } from 'node:console';
//
// This file creates an OpenAPI file
//
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
extendZodWithOpenApi(z);


const example_collection = {
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
    "hello"
  ]
}

const example_discount = {
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

const example_post = {
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

const example_shipping = {
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

const example_product = {
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

const example_order = {
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

// Register definitions here
const create_query = () => {
  const cursor = z.string().optional().openapi(
    { 
      examples: [
        '(updated_at:2024-01-24T20:28:24.126Z, id:tag_65b172ebc4c9552fd46c1027)',
        '(updated_at:"2024-01-24T20:28:24.126Z", id:"tag_65b172ebc4c9552fd46c1027")',
        '(price: 50, updated_at:"2024-01-24T20:28:24.126Z")',
        '(active: true)',
        '(active: false)',
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
    equals: cursor,
    sortBy: z.string().optional().openapi(
      { 
        examples: ['(updated_at,id)', '(price)'],
        description: 'A cursor of Keys in CSV format, example: `(updated_at,id)`',
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

const apply_security = () => {

  return {
    security: [
      {
        apiKeyAuth: [],
        bearerAuth: [],
        basicAuth: []
      }
    ]
  }
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

  const basicAuth = registry.registerComponent(
    'securitySchemes',
    'basicAuth',
    {
      type: 'http',
      scheme: 'basic',
    }
  );

  const apiKeyAuth = registry.registerComponent(
    'securitySchemes',
    'apiKeyAuth',
    {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-KEY'
    }
  );

  // register routes
  register_reference(registry);
  register_ai(registry);
  register_similarity_search(registry);
  register_auth(registry);
  register_storage(registry);
  register_checkout(registry);
  register_payments(registry);
  register_extensions(registry);
  register_quick_search(registry);
  register_statistics(registry)
  register_emails(registry);
  register_tags(registry);
  register_templates(registry);
  register_collections(registry);
  register_products(registry);
  register_shipping(registry);
  register_customers(registry);
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
    servers: [{ url: '/api' }],
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
 * @param {z.infer<ZodSchema>} example 
 * @param {string} [aug_description] 
 * @param {any} [extra] 
 */
const register_base_get = (
  registry, slug_base, name, tags, example_id, zod_schema, 
  example, aug_description='', extra={}
  ) => {

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}`,
    description: `Get ${name} data by its \`id\` or \`handle\` \n${aug_description}`,
    summary: `Get a single ${name}`,
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
            description: `The \`id\` or \`handle\` of ${name}`
          }
        ),
      }),
      query: z.object({
        expand: z.string().optional().openapi(
          { 
            examples: ['(collections,search)', '*'],
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
 * @param {z.infer<ZodSchema>} example 
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
    ...apply_security()
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {string} example_id 
 * @param {string} [description] 
 */
const register_base_delete = (registry, slug_base, name, tags, example_id, description) => {
  
  registry.registerPath({
    method: 'delete',
    path: `/${slug_base}/{id_or_handle}`,
    description: description ?? `Delete a \`${name}\``,
    summary: `Delete a single ${name}`,
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
            description: `The \`id\` or \`handle\` of ${name}`
          }
        ),
      }),
    },
    responses: {
      200: {
        description: 'Item was deleted',
      },
      ...error() 
    },
    ...apply_security()
  });
}

/**
 * @param {OpenAPIRegistry} registry 
 * @param {string} slug_base 
 * @param {string} name 
 * @param {string[]} tags 
 * @param {ZodSchema} zod_schema 
 * @param {z.infer<ZodSchema>} example 
 * @param {any} [extra] 
 * @param {string} [aug_description] 
 * @param {boolean} [with_count_query=true] 
 */
const register_base_list = (
  registry, slug_base, name, tags, zod_schema, example, 
  extra={}, aug_description='', with_count_query=true
) => {
  
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}`,
    summary: `Query ${name} items`,
    description: `List and filter items \n ${aug_description}`,
    tags,
    request: {
      query: create_query(),
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

  if(with_count_query) {
    registry.registerPath({
      method: 'get',
      path: `/${slug_base}/count_query`,
      summary: `Count Query of ${name} items`,
      description: `Count the query of filtered items \n ${aug_description}`,
      tags,
      request: {
        query: create_query(),
      },
      responses: {
        200: {
          description: `Count of items satisfying the query of \`${name}s\``,
          content: {
            'application/json': {
              schema: z.object({count: z.number()}),
            },
          },
        },
        ...error() 
      },
      ...extra
    });
  }

}


/**
 * @param {OpenAPIRegistry} registry 
 */
const register_checkout = (registry) => {
  registry.register('pricingData', pricingDataSchema);
  const _checkoutCreateTypeSchema = registry.register('checkoutCreateType', checkoutCreateTypeSchema);

  const example_checkout = {
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
  }

  const example_draft_order = {
    ...example_checkout,
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


  registry.registerPath({
    method: 'post',
    path: `/checkout/create?gateway={gateway}`,
    description: `Create a Checkout for an order`,
    summary: `Create a Checkout for an order`,
    tags: ['checkout'],
    request: {
      query: z.object(
        {
          gateway: z.string().openapi(
            { 
              example: 'paypal_standard', 
              description: 'The payment gateway handle to use' 
            }
          ),
      
        }
      ),
      body: {
        description: 'draft `order` data',
        content: {
          "application/json": {
            schema: _checkoutCreateTypeSchema,
            example: example_checkout
          }
        }
      }
    },
    responses: {
      200: {
        description: 'draft `order` data with payment gateway result',
        content: {
          'application/json': {
            schema: orderDataSchema,
            example: {
            }
          },
        },
      },
      ...error() 
    },
  });


  registry.registerPath({
    method: 'post',
    path: `/checkout/{order_id}/complete`,
    description: `Complete a Checkout for an \`order\`, on result, you get back an order with updated status, which you can use to inspect success`,
    summary: `Complete a Checkout for an order`,
    tags: ['checkout'],
    request: {
      params: z.object(
        {
          order_id: z.string().openapi(
            { 
              example: 'order_66333f8605ea3a380bbc96fc', 
              description: 'The `order` id' 
            }
          ),
      
        }
      ),
    },
    responses: {
      200: {
        description: 'draft `order` data with payment gateway result',
        content: {
          'application/json': {
            schema: orderDataSchema,
            example: example_draft_order
          },
        },
      },
      ...error() 
    },
  });


  registry.registerPath({
    method: 'post',
    path: `/checkout/pricing`,
    description: 'Get a pricing for an order. order should at least have the `line items`, `shipping` and `coupons`',
    summary: `Get a pricing for an order`,
    tags: ['checkout'],
    request: {
      body: {
        description: 'draft `order` data ',
        content: {
          "application/json": {
            schema: orderDataSchema,
            example: {
              line_items: [
                {
                  id: 'pr_....',
                  qty: 2
                }
              ],
              shipping_method: {
                id: 'ship_....'
              },
              coupons: [
                'special-100'
              ],
              contact: {
                customer_id: 'au_.... (can also be cus_...)'
              }
        
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Pricing data',
        content: {
          'application/json': {
            schema: pricingDataSchema,
            example: {
              "subtotal_discount": 0,
              "subtotal_undiscounted": 50,
              "subtotal": 50,
              "total": 100,
              "quantity_total": 1,
              "quantity_discounted": 0,
              "errors": [],
              "evo": [
                {
                    "quantity_discounted": 0,
                    "quantity_undiscounted": 1,
                    "discount": {
                        "active": true,
                        "application": {
                            "id": 0,
                            "name": "Automatic",
                            "name2": "automatic"
                        },
                        "handle": "10-off-api-products-discounts-test-js-6",
                        "priority": 0,
                        "title": "10% OFF (6)",
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
                                        "pr-api-products-discounts-test-js-1",
                                        "pr-api-products-discounts-test-js-2"
                                    ]
                                }
                            ]
                        },
                        "id": "dis_66333fb405ea3a380bbc970b",
                        "created_at": "2024-05-02T07:24:36.038Z",
                        "updated_at": "2024-05-02T07:24:36.038Z",
                        "search": [
                            "handle:10-off-api-products-discounts-test-js-6",
                            "10-off-api-products-discounts-test-js-6",
                            "id:dis_66333fb405ea3a380bbc970b",
                            "dis_66333fb405ea3a380bbc970b",
                            "66333fb405ea3a380bbc970b",
                            "active:true",
                            "10",
                            "6",
                            "10% off (6)",
                            "app:0",
                            "app:automatic",
                            "type:0",
                            "type:regular"
                        ]
                    },
                    "discount_code": "10-off-api-products-discounts-test-js-6",
                    "total_discount": 0,
                    "subtotal": 50,
                    "total": 100,
                    "line_items": [
                        {
                            "id": "pr-api-collections-products-test-js-1",
                            "qty": 1,
                            "price": 50,
                            "data": {
                                "handle": "pr-api-collections-products-test-js-1",
                                "active": true,
                                "price": 50,
                                "qty": 4,
                                "title": "product 1",
                                "id": "pr_66333f4705ea3a380bbc96e5",
                                "created_at": "2024-05-02T07:22:47.732Z",
                                "updated_at": "2024-05-05T09:53:37.633Z"
                            },
                            "stock_reserved": 0
                        }
                    ]
                }
              ],
              "shipping_method": {
                  "handle": "ship-api-storefronts-all-connections-test-js-2",
                  "title": "ship 2",
                  "price": 50,
                  "id": "ship_66333fec05ea3a380bbc971b",
                  "created_at": "2024-05-02T07:25:32.505Z",
                  "updated_at": "2024-05-05T17:45:20.069Z",
                  "search": [
                      "handle:ship-api-storefronts-all-connections-test-js-2",
                      "ship-api-storefronts-all-connections-test-js-2",
                      "id:ship_66333fec05ea3a380bbc971b",
                      "ship_66333fec05ea3a380bbc971b",
                      "66333fec05ea3a380bbc971b",
                      "ship",
                      "2",
                      "ship 2"
                  ],
                  "active": true
              },
            }
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
const register_emails = (registry) => {

  const mailAttachment = z.object(
    {
      filename: z.string().optional(),
      content: z.string(),
      content_type: z.string().optional(),
      content_id: z.string().optional(),
      disposition: z.union([z.literal('attachment'), z.literal('inline')]).optional()
    }
  ).describe('Mail attachment');

  const mailAddress = z.object(
    {
      name: z.string().optional().describe('name of addressee'),
      address: z.string().optional().describe('the email address'),
    }
  ).describe('Mail address');

  const mailObject = z.object(
    {
      from: mailAddress,
      to: z.array(mailAddress),
      subject: z.string(),
      html: z.string(),
      text: z.string(),
      attachments: z.array(mailAttachment).optional()
    }
  ).describe('Mail object');

  registry.register('MailObject', mailObject);
  registry.register('MailAddress', mailAddress);
  registry.register('MailAttachment', mailAttachment);

  registry.registerPath({
    method: 'post',
    path: `/emails/send`,
    description: 'Send an email',
    summary: 'Send an email to multiple recipients',
    tags: ['emails'],
    request: {
      body: {
        content: {
          "application/json": {
            schema: mailObject,
            example: {
              from: { name: 'StoreCraft', address: '  [email protected] ' },
              to: [{ name: 'Customer', address: '  [email protected] ' }],
              subject: 'Order Confirmation',
              html: '<h1>Order Confirmation</h1><p>Your order has been confirmed</p>',
              text: 'Order Confirmation\nYour order has been confirmed',
              attachments: [
                { filename: 'invoice.pdf', content: 'base64...', content_type: 'application/pdf' }
              ]
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: "ok",
      },
      ...error(),
    },
    ...apply_security()
  });

  const sendMailWithTemplateParams = z.object(
    {
      emails: z.array(z.string()).describe('The email addresses to send the email to'),
      template_handle: z.string().describe('The template `handle` or `id` in the database'),
      subject: z.string().describe('Subject of the email'),
      data: z.any().describe('Key-value data to be used in the template')
    }
  ).describe('Parameters for sending mail with a template');

  registry.register('SendMailWithTemplateParams', sendMailWithTemplateParams);

  registry.registerPath({
    method: 'post',
    path: `/emails/send-with-template`,
    description: 'Send an email with a template',
    summary: 'Send an email to multiple recipients with a template',
    tags: ['emails'],
    request: {
      body: {
        content: {
          "application/json": {
            schema: sendMailWithTemplateParams,
            example: {
              emails: ['  [email protected] '],
              template_handle: 'order-confirmation',
              subject: 'Order Confirmation',
              data: { order_id: '12345' }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: "ok",
      },
      ...error(),
    },
    ...apply_security()
  });


}


/**
 * @param {OpenAPIRegistry} registry 
 */
const register_ai = (registry) => {

  const aiMessageTextContent = z.object(
    {
      type: z.literal("text"),
      content: z.string().optional().describe('text or prompt'),
    }
  ).describe('Text content');

  const aiMessageTextDeltaContent = z.object(
    {
      type: z.literal("delta_text"),
      content: z.string().optional().describe('Partial text update'),
    }
  ).describe('Text delta / update');

  const aiMessageToolUseContent = z.object(
    {
      type: z.literal("tool_use"),
      content: z.object(
        {
          name: z.string().optional().describe("Name of the tool"),
          id: z.string().optional().describe("id of the tool call"),
          title: z.string().optional().describe("Optional readable name"),
        }
      ),
    }
  ).describe('Tool use update content');

  const aiMessageToolResultContent = z.object(
    {
      type: z.literal("tool_result"),
      content: z.object(
        {
          data: z.any().describe("Result of the tool call"),
          id: z.string().optional().describe("id of the tool call"),
        }
      ),
    }
  ).describe('Tool result update content');

  const aiMessageImageContent = z.object(
    {
      type: z.literal("image"),
      content: z.string().optional().describe("base64 encoded image"),
    }
  ).describe('Image content');

  const aiMessageObjectContent = z.object(
    {
      type: z.literal("object"),
      content: z.any().optional().describe("any object"),
    }
  ).describe('Object content');

  const aiMessageErrorContent = z.object(
    {
      type: z.literal("error"),
      content: z.union([
        z.string().optional().describe("any object"),
        z.object(
          {
            code: z.string().optional().describe("code of error"),
            message: z.string().optional().describe("message of error"),
          }
        )
      ]),
    }
  ).describe('Error content');

  const all_messages = z.union(
    [
      aiMessageTextContent, aiMessageTextDeltaContent, aiMessageToolUseContent,
      aiMessageToolResultContent, aiMessageObjectContent, aiMessageImageContent, 
      aiMessageErrorContent
    ]
  ).describe('All messages types between user and LLM')

  const storeAgentRunParametersSchema = z.object(
    {
      thread_id: z.string().optional().describe('the id of the conversation, for future usage'),
      prompt: z.array(z.union([aiMessageTextContent, aiMessageImageContent])).describe('Current customer prompt'),
      maxTokens: z.number().optional().describe('Max tokens'),
      maxSteps: z.number().optional().describe('Max steps per agent'),
    }
  ).describe('The agent run parameters');

  const storeAgentRunResponseSchema = z.object(
    {
      thread_id: z.string().optional().describe('the id of the conversation, for future usage'),
      contents: z.array(all_messages).describe('Current **LLM** formatted responses'),
    }
  ).describe('The response');

  registry.register('aiMessageTextContent', aiMessageTextContent);
  registry.register('aiMessageTextDeltaContent', aiMessageTextDeltaContent);
  registry.register('aiMessageToolUseContent', aiMessageToolUseContent);
  registry.register('aiMessageToolResultContent', aiMessageToolResultContent);
  registry.register('aiMessageObjectContent', aiMessageObjectContent);
  registry.register('aiMessageImageContent', aiMessageImageContent);
  registry.register('aiMessageErrorContent', aiMessageErrorContent);

  registry.register(
    'storeAgentRunParameters', storeAgentRunParametersSchema
  );
  registry.register(
    'storeAgentRunResponseSchema', storeAgentRunResponseSchema
  );

  registry.registerPath({
    method: 'post',
    path: `/ai/agents/{agent_handle}/stream`,
    description: 'Speak with `Storecraft` AI agent in stream (Server-Sent Events)',
    summary: 'Speak with AI agent (stream)',
    tags: ['ai'],
    request: {
      params: z.object(
        {
          agent_handle: z.string().openapi({description: 'agent identifier', example: 'store'})
        }
      ),
      body: {
        content: {
          "application/json": {
            schema: storeAgentRunParametersSchema,
            example: {
              prompt: [
                {
                  type: 'text',
                  content: 'What is the price of Super Mario for the NES console ?'
                }
              ]
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: "JSON updates of text and tools (\`content\` data type) with Server-Sent Events formats, such as `data: { type: 'delta_text', content: ' games. Specifically, there' }`",
        content: {
          'text/event-stream': {
            schema: z.string(),
            example: "data: { type: 'delta_text', content: ' games. Specifically, there' }",
          },
        },
        headers: z.object(
          {
            'X-STORECRAFT-THREAD-ID': z.string().openapi(
              {
                example: 'thread_sdj9musd8sd9m8sd8',
                description: 'The thread / conversation identifier'
              }
            )
          }
        )

      },
      ...error() 
    },
  });

  registry.registerPath({
    method: 'post',
    path: `/ai/agents/{agent_handle}/run`,
    description: 'Speak with `Storecraft` AI agent synchronously',
    summary: 'Speak with AI agent (sync)',
    tags: ['ai'],
    request: {
      params: z.object(
        {
          agent_handle: z.string().openapi({description: 'agent identifier', example: 'store'})
        }
      ),
      body: {
        content: {
          "application/json": {
            schema: storeAgentRunParametersSchema,
            example: {
              prompt: [
                {
                  type: 'text',
                  content: 'What is the price of Super Mario for the NES console ?'
                }
              ]
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: `LLM formatted/readable Response`,
        headers: z.object(
          {
            'X-STORECRAFT-THREAD-ID': z.string().openapi(
              {
                example: 'thread_sdj9musd8sd9m8sd8',
                description: 'The thread / conversation identifier'
              }
            )
          }
        ),
        content: {
          'application/json': {
            schema: storeAgentRunResponseSchema,
            example: {
              contents: [
                {
                  type: 'tool_use',
                  content: [ { name: 'search_products', id: 'toolu_01VCfArjSHTVXATyCfBanF3q' } ]
                },
                {
                  type: 'tool_result',
                  content: { data: { result: 100 }, id: 'toolu_01VCfArjSHTVXATyCfBanF3q' }
                },
                {
                  type: 'text',
                  content: 'It is 100$, can I help you with more Mario games ?'
                }
              ]
            },
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
const register_similarity_search = (registry) => {
  
  registry.register('similaritySearchResultSchema', similaritySearchResultSchema);
  
  registry.registerPath({
    method: 'get',
    path: `/similarity-search`,
    description: 'Search `Storecraft` with AI for `products`, `discounts`, `collections`, `shipping`',
    summary: 'Search with AI',
    tags: ['similarity-search'],
    request: {
      query: z.object(
        {
          'q': z.string().openapi({description: 'Human query', example: 'I am looking for Super Mario Games for Nintndo Switch'}),
          'namespaces': z.string().optional().openapi({description: 'Filter query further by a category specified in a CSV format string', examples: ['products,discounts', 'all'], default: 'all'}),
          // 'namespaces': z.enum(['products', 'discounts', 'collections', 'shipping', 'all', '*']).optional().openapi({description: 'Filter query further by a category', examples: ['products', 'all'], default: 'all'}),
          'limit': z.number().optional().openapi({description: 'Limit the query to Top K similar results', examples: [5], default: 5})
        }
      )
    },
    responses: {
      200: {
        description: "A list of similar entities",
        content: {
          'application/json': {
            schema: similaritySearchResultSchema,
            example: {
              context: {
                metric: 'cosine',
                dimensions: 1536
              },
              items: [
                {
                  score: 0.0032,
                  namespace: 'products',
                  content: {
                    id: 'pr_sdsduhd77238dsjisjd9',
                    handle: 'super-mario-world',
                    price: 49,
                    description: '...',
                  }
                }
              ]
            }
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
const register_reference = (registry) => {
  registry.register('storecraftConfigSchema', storecraftConfigSchema);

  registry.registerPath({
    method: 'get',
    path: `/reference/settings`,
    description: `Get the settings of your store`,
    summary: `Get the settings of your store`,
    tags: ['reference'],
    responses: {
      200: {
        description: `Your storecraft settings`,
        content: {
          'application/json': {
            schema: storecraftConfigSchema,
            example: {
              general_store_name: 'Wush Wush Games',
              general_store_website: 'https://wush.games',
              general_store_description: 'We sell retro video games',
              general_store_support_email: 'support@wush.games',
              auth_admins_emails: ['admin@wush.games'],
              auth_password_hash_rounds: 10,
              auth_secret_access_token: '<secret>',
              auth_secret_refresh_token: '<secret>',
              checkout_reserve_stock_on: 'never',
              storage_rewrite_urls: 'https://cdn.wush.games/'
            }
          },
        },
      },
      ...error() 
    },
    ...apply_security()
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
  const _apiAuthChangePasswordTypeSchema = registry.register(`AuthChangePassword`, apiAuthChangePasswordTypeSchema);
  const _apiAuthResultSchema = registry.register(`ApiAuthResult`, apiAuthResultSchema);
  const _apiKeyResultSchema = registry.register(`ApiKey`, apiKeyResultSchema);
  const _authUserTypeSchema = registry.register(`AuthUserType`, authUserTypeSchema);

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
    { slug: '/auth/signup', schema_request: _signupTypeSchema, desc: 'Signup a user', extra: {} },
    { slug: '/auth/signin', schema_request: _signinTypeSchema, desc: 'Signin a user', extra: {} },
    { slug: '/auth/refresh', schema_request: _refreshTypeSchema, desc: 'Refresh a token', extra: {} },
    { slug: '/auth/change-password', schema_request: _apiAuthChangePasswordTypeSchema, desc: 'Change Password', extra: {} },
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
                schema: it.schema_request,
              },
            },
          }
        },
        responses: {
          200: {
            description: 'auth info',
            content: {
              "application/json": {
                schema: _apiAuthResultSchema,
                example
              },
            },
          },
          ...error() 
        },
      });
    }
  );

  // remove a auth user

  const example_auth_user = {
    "id": "au_662f70821937f16320a8debb",
    "email": "au_662f70821937f16320a8debb@apikey.storecraft.api",
    "confirmed_mail": false,
    "roles": [
        "admin"
    ],
    "tags": [
        "apikey"
    ],
    "active": true,
    "description": "This user is a created apikey with roles: [admin]",
    "created_at": "2024-04-29T10:03:46.835Z",
    "updated_at": "2024-04-29T10:03:46.835Z",
    "search": [
        "email:true",
        "email:au_662f70821937f16320a8debb@apikey.storecraft.api",
        "au_662f70821937f16320a8debb@apikey.storecraft.api",
        "confirmed_mail:false",
        "tag:apikey",
        "au_662f70821937f16320a8debb",
        "role:admin"
    ]
  }

  registry.registerPath(
    {
      method: 'get',
      path: '/auth/users/{email_or_id}',
      description: 'get auth user',
      summary: 'Get auth user',
      tags,
      request: {
        params: z.object({
          email_or_id: z.string().openapi(
            { 
              examples: ['au_65f98390d6a34550cdc651a1', 'a@a.com'],
              description: `The \`id\` or \`email\` of auth user`
            }
          ),
        }),
      },
      responses: {
        200: {
          description: 'api key info',
          content: {
            "application/json": {
              schema: authUserTypeSchema,
              example: example_auth_user
            }
          }
        },
        ...error() 
      },
      ...apply_security()
    }
  );  

  // remove a auth user
  registry.registerPath(
    {
      method: 'delete',
      path: '/auth/users/{email_or_id}',
      description: 'Remove auth user',
      summary: 'Remove auth user',
      tags,
      request: {
        params: z.object({
          email_or_id: z.string().openapi(
            { 
              examples: ['au_65f98390d6a34550cdc651a1', 'a@a.com'],
              description: `The \`id\` or \`email\` of auth user`
            }
          ),
        }),
      },
      responses: {
        200: {
          description: 'api key info',
        },
        ...error() 
      },
      ...apply_security()
    }
  );  

  // api keys

  const exmaple_api_key = {
    apikey: 'eyJzdWIiOiJhdV82NWY5ODM5MGQ2YTM0NTUwY2RjNjUxYTEiLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3MTA4NTEwMDksImV4cCI6MTcxMDg1NDYwOX0'
  }

  
  registry.registerPath(
    {
      method: 'post',
      path: '/auth/apikeys',
      description: `Create a new API Key. Api key is a \`base64\` url encoded 
      \`base64_url(id@apikey.storecraft.api:password)\`, the \`password\` is **not saved** at the database, only 
      the hashed password. This can be used in **ANY** the following headers \n
      - Authorization: Basic <apikey> \n
      - X-API-KEY: <apikey>`,
      summary: 'Create API Key',
      tags,
      responses: {
        200: {
          description: 'api key info',
          content: {
            "application/json": {
              schema: _apiKeyResultSchema,
              example: exmaple_api_key
            },
          },
        },
        ...error() 
      },
      ...apply_security()
    },
  );

  registry.registerPath(
    {
      method: 'get',
      path: '/auth/apikeys',
      description: 'List All API Keys Auth users',
      summary: 'List All API Key Auth users',
      tags,
      responses: {
        200: {
          description: 'auth user list',
          content: {
            "application/json": {
              schema: z.array(authUserTypeSchema),
              example: [
                example_auth_user, example_auth_user
              ]
            },
          },
        },
        ...error() 
      },
      ...apply_security()
    }
  );

  registry.registerPath(
    {
      method: 'get',
      path: `/auth/users`,
      description: 'Query and Filter Authenticated users',
      summary: 'Query / Filter auth users',
      tags,
      request: {
        query: create_query()
      },
      responses: {
        200: {
          description: 'auth user list',
          content: {
            "application/json": {
              schema: z.array(authUserTypeSchema),
              example: [example_auth_user, example_auth_user]
            },
          },
        },
        ...error() 
      },
      ...apply_security()
    }
  );  

  registry.registerPath(
    {
      method: 'get',
      path: `/auth/users/count_query`,
      description: 'Count users query',
      summary: 'Count the auth users Query / Filter',
      tags,
      request: {
        query: create_query()
      },
      responses: {
        200: {
          description: 'count',
          content: {
            "application/json": {
              schema: z.object({ count: z.number() }),
            },
          },
        },
        ...error() 
      },
      ...apply_security()
    }
  );  


  // confirmations

  registry.registerPath(
    {
      method: 'get',
      path: `/auth/confirm-email`,
      description: 'Confirm an email with token, dispatches `auth/confirm-email` event',
      summary: 'Confirm email of user',
      tags,
      request: {
        query: z.object(
          {
            token: z.string({description: 'confirm email token'})
          }
        )
      },
      responses: {
        200: {
          description: 'all good',
        },
        ...error() 
      },
      ...apply_security()
    }
  );  

  registry.registerPath(
    {
      method: 'get',
      path: `/auth/forgot-password-request`,
      description: 'Start a `forgot-password` flow, dispatches `auth/forgot-password-token-generated` event with token, that can be messaged to a user',
      summary: 'Forgot Password Request',
      tags,
      request: {
        query: z.object(
          {
            email: z.string({description: 'email or auth_id'})
          }
        )
      },
      responses: {
        200: {
          description: 'all good',
        },
        ...error() 
      },
      ...apply_security()
    }
  );  
  
  registry.registerPath(
    {
      method: 'get',
      path: `/auth/forgot-password-request-confirm`,
      description: 'Confirm identity of `forgot-password` flow initiator, dispatches `auth/forgot-password-token-confirmed` event with token, and also setups a new temporal password and returns it, you can display it to the user or even email it',
      summary: 'Forgot Password Request Confirm',
      tags,
      request: {
        query: z.object(
          {
            token: z.string({description: 'token genrated by the `forgot-password-request` flow'})
          }
        )
      },
      responses: {
        200: {
          description: 'email and password',
          content: {
            "application/json": {
              schema: z.object({ email: z.string(), password: z.string()}),
            },
          },
        },
        ...error() 
      },
      ...apply_security()
    }
  );  
    

  // auth providers

  const AuthProviderSchema = registry.register(
    `AuthProvider`, 
    oAuthProviderSchema
  );

  registry.registerPath(
    {
      method: 'get',
      path: `/auth/identity-providers`,
      description: 'Get the list of registered identity providers',
      summary: 'List Auth Providers',
      tags,
      responses: {
        200: {
          description: 'List of auth providers',
          content: {
            "application/json": {
              schema: z.array(AuthProviderSchema).openapi({description: 'List of auth providers', example: [{ name: 'Google', provider: 'google', logo_url: 'data:image/png;...', description: 'Google OAuth2' }]}), 
            },
          },
        },
        ...error() 
      },
    }
  );  
  
  const _oAuthProviderCreateURIParamsSchema = registry.register(
    'OAuthProviderCreateURIParams',
    oAuthProviderCreateURIParamsSchema
  );

  const _oAuthProviderCreateURIResponseSchema = registry.register(
    'OAuthProviderCreateURIResponse',
    oAuthProviderCreateURIResponseSchema
  );

  registry.registerPath(
    {
      method: 'post',
      path: `/auth/identity-providers/create-authorization-uri`,
      description: 'Create Authorization URI from the provider',
      summary: 'Create Authorization URI',
      tags,
      request:{
        body: {
          content: {
            "application/json": {
              schema: _oAuthProviderCreateURIParamsSchema
            }
          }
        }
      },
      responses: {
        200: {
          description: 'URI to redirect your user',
          content: {
            "application/json": {
              schema: _oAuthProviderCreateURIResponseSchema
            },
          },
        },
        ...error() 
      },
    }
  );    

  const _signWithOAuthProviderParamsSchema = registry.register(
    'SignWithOAuthProviderParams',
    signWithOAuthProviderParamsSchema
  );

  registry.registerPath(
    {
      method: 'post',
      path: `/auth/identity-providers/sign`,
      description: 'Signin / Signup with Identity Provider',
      summary: 'Signin with Identity Provider',
      tags,
      request:{
        body: {
          content: {
            "application/json": {
              schema: _signWithOAuthProviderParamsSchema
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Access Tokens for `storecraft`',
          content: {
            "application/json": {
              schema: _apiAuthResultSchema
            },
          },
        },
        ...error() 
      },
    }
  );    
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
            example: 'images/test.png'
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
            example: 'images/test.png'
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
    method: 'put',
    path: '/storage/{file_key}?signed=false',
    description: 'Upload a file directly into the backend, this is discouraged, we do encourage to use `presigned` url variant',
    summary: 'Upload a file (directly)',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: 'images/test.png',
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
    ...apply_security()
  });

  // upload (presigned url)
  registry.registerPath({
    method: 'put',
    path: '/storage/{file_key}?signed=true',
    description: 'Upload a file indirectly into the backend, most cloud storages allow this feature',
    summary: 'Upload a file (presigned url)',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: 'images/test.png',
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
    ...apply_security()
  });

  // delete
  registry.registerPath({
    method: 'delete',
    path: '/storage/{file_key}',
    description: 'Delete a file',
    summary: 'Delete a file',
    tags,
    request: {
      params: z.object({
        file_key: z.string().openapi(
          { 
            example: 'images/test.png',
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
    ...apply_security()
  });  

  // options features
  registry.registerPath({
    method: 'get',
    path: '/storage',
    description: 'You can query the features, that are supported by the current `storage` driver. We use it\
    mainly to confirm if the `storage` supports `pre-signed` urls for `download` / `upload`',
    summary: 'Get Storage features',
    tags,
    responses: {
      200: {
        description: `Object with \`features\``,
        content: {
          'application/json': {
            schema: z.object(
              {
                supports_signed_urls: z.boolean().openapi(
                  {
                    example: true,
                    description: 'Does the `storage` driver supports pre-signed urls ?'
                  }
                )
              }
            ),
            example: {
              supports_signed_urls: true
            }
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
const register_collections = registry => {
  const name = 'collection'
  const slug_base = 'collections'
  const tags = [`${name}s`];
  const examples = ['col_65f2ae568bf30e6cd0ca95ea', 'playstation-games'];
  const _typeSchema = registry.register(name, collectionTypeSchema);
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, collectionTypeUpsertSchema
    );

  register_base_get(
    registry, slug_base, name, tags, examples[0], 
    _typeSchema, example_collection
    );
  register_base_upsert(
    registry, slug_base, name, tags, examples[0], 
    _typeUpsertSchema, example_collection
    );
  register_base_delete(registry, slug_base, name, tags, examples[0]);
  register_base_list(
    registry, slug_base, name, tags, _typeUpsertSchema, 
    example_collection
    );

  // list and filter collection products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products`,
    description: 'Each `collection` is linked to `products`, you can query and filter these `products` by collection',
    summary: 'Query collection\'s products',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            examples,
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
              example_product, example_product
            ]
          },
        },
      },
      ...error() 
    },
  });

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products/count_query`,
    description: 'Each `collection` is linked to `products`, you can count the query of these `products` by collection',
    summary: 'Count collection\'s products query',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            examples,
            description: '`id` or `handle`'
          }
        ),
      }),
      query: create_query()
    },
    responses: {
      200: {
        description: `count`,
        content: {
          'application/json': {
            schema: z.object({count: z.number()}),
          },
        },
      },
      ...error() 
    },
  });

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products/used_tags`,
    description: 'List all of the used tags of products in a collection, This is helpful for building a filter system in the frontend if you know in advance all the tags of the products in a collection',
    summary: 'List All Used Collection\'s Products Tags',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            examples,
            description: '`id` or `handle`'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of all of the tags of the products in the collection`,
        content: {
          'application/json': {
            schema: z.array(z.string()),
            example: [
              'genre-action', 'genre-comedy', 'console-ps4', 'color-red', 'color-blue' 
            ]
          },
        },
      },
      ...error() 
    },
  });

  registry.registerPath({
    method: 'post',
    path: `/${slug_base}/{id_or_handle}/export`,
    description: 'Export a colletion of `products` into the `storage`. This is beneficial for `collections`, that hardly change and therefore can be efficiently stored in a cost-effective `storage` and **CDN** network.',
    summary: 'Export collection to storage json',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            examples,
            description: '`id` or `handle` of the collection'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `json url`,
        content: {
          'application/json': {
            schema: z.string().describe('storage path of the exported collection'),
            example: ['storage://collections/col_65dc619ac40344c9a1dd6755.json', 'storage://collections/playstation-games.json']
          },
        },
      },
      ...error() 
    },
    ...apply_security()    
  });
    
}


/**
 * @param {OpenAPIRegistry} registry 
 */
const register_statistics = registry => {
  const name = 'statistics'
  const slug_base = 'statistics'
  const tags = [`${name}`];
  const ordersStatisticsType = registry.register(
    `OrdersStatisticsType`, ordersStatisticsTypeSchema.describe('`orders` / `sales` statistics')
    );

  // list and filter collection products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/orders`,
    description: 'Compute the `statistics` of `sales` / `orders` a period of time per day.',
    summary: 'Compute Sales Statistics',
    tags,
    request: {
      query: z.object({
        fromDay: z.string().openapi(
          { 
            examples: ['2023-01-01T00:00:00Z', '0290902930923'],
            description: '`ISO` / `UTC` / `timestamp` date'
          }
        ),
        toDay: z.string().openapi(
          { 
            examples: ['2023-01-01T00:00:00Z', '0290902930923'],
            description: '`ISO` / `UTC` / `timestamp` date'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `Filtered product\'s of a collection`,
        content: {
          'application/json': {
            schema: ordersStatisticsType,
          },
        },
      },
      ...error() 
    },
    ...apply_security()
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
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}


/**
 * @param {OpenAPIRegistry} registry 
 */
const register_templates = registry => {
  const name = 'template'
  const slug_base = 'templates'
  const tags = [slug_base];
  const example_id = 'template_65f2ae568bf30e6cd0ca95ea';
  const _typeSchema = registry.register(name, tagTypeSchema);
  const _typeUpsertSchema = registry.register(`${name}Upsert`, tagTypeUpsertSchema);
  const example = {
    "title": "Welcome Customer",
    "template_html": "<html><body>Hello {{name}}</body></html>",
    "template_text": "Hello {{name}}",
    "reference_example_input": {
      "name": "Tomer"
    },
    "handle": "welcome-customer",
    "id": "template_664afed24eba71b9ee185be4",
    "created_at": "2024-05-20T07:42:10.436Z",
    "updated_at": "2024-05-20T09:39:46.492Z",
  }
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example);
  register_base_delete(registry, slug_base, name, tags, example_id);
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
  
  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example_shipping);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example_shipping);
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example_shipping);
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

  register_base_get(
    registry, slug_base, name, tags, example_id,
    _typeSchema, example, '', apply_security(),
    );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeUpsertSchema, example
    );

  const desc_delete = `When removing a \`customer\`, the 
  following side effects will happen:\n 
  - Referenced \`auth_user\` will be removed as well \n 
  `

  register_base_delete(registry, slug_base, name, tags, example_id, desc_delete);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example, apply_security()
  );

  // list customer order
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_email}/orders`,
    description: 'Query customer orders, this is only available \
    to `admin` and the `customer` (with auth token)',
    summary: 'Query customer orders',
    tags,
    request: {
      params: z.object({
        id_or_email: z.string().openapi(
          { 
            example: 'a@a.com',
            description: '`id` or `email`'
          }
        ),
      }),
      query: create_query()
    },
    responses: {
      200: {
        description: `Filtered orders`,
        content: {
          'application/json': {
            schema: z.array(variantTypeSchema),
            example: [
              example_order, example_order
            ]
          },
        },
      },
      ...error() 
    },
  });

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_email}/orders/count_query`,
    description: 'Count customer orders query, this is only available \
    to `admin` and the `customer` (with auth token)',
    summary: 'Count customer orders query',
    tags,
    request: {
      params: z.object({
        id_or_email: z.string().openapi(
          { 
            example: 'a@a.com',
            description: '`id` or `email`'
          }
        ),
      }),
      query: create_query()
    },
    responses: {
      200: {
        description: `count of query`,
        content: {
          'application/json': {
            schema: z.object({count: z.number()}),
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
const register_discounts = registry => {
  const name = 'discount'
  const slug_base = 'discounts'
  const tags = [slug_base];
  const example_id = 'dis_65f2ae888bf30e6cd0ca9600';
  const _typeSchema = registry.register(name, discountTypeSchema);
  const _typeUpsertSchema = registry.register(
    `${name}Upsert`, discountTypeUpsertSchema
    );
  
  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example_discount
    );

  const desc_upsert = `When upserting a \`discount\`, 
  the following side effects will happen:\n 
  - \`Products\` will be inspected and updated with eligibility 
  to the \`discount\` if they meet criterions \n
  `

  register_base_upsert(registry, slug_base, name, tags, 
    example_id, _typeUpsertSchema, example_discount, desc_upsert);
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(registry, slug_base, name, tags, 
    _typeUpsertSchema, example_discount);

  // list and filter discount's products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products`,
    description: 'Each `discount` has eligible `products`, \
      you can query and filter these `products` by discount',
    summary: 'Query discount\'s eligible products',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
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
            example: [example_product]
          },
        },
      },
      ...error() 
    },
  });

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products/count_query`,
    description: 'Each `discount` has eligible `products`, \
      you can count the query `products` by discount',
    summary: 'Count discount\'s eligible products query',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
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
            schema: z.object({count: z.number()}),
          },
        },
      },
      ...error() 
    },
  }); 
  
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/products/tags`,
    description: 'List all the tags of products in a discount, This is helpful for building a filter system in the frontend if you know in advance all the tags of the products in a discount',
    summary: 'List All collection\'s products tags',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            examples: ['dis_65f2ae888bf30e6cd0ca9600', 'discount-10'],
            description: '`id` or `handle`'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List of all of the tags of the products in the discount`,
        content: {
          'application/json': {
            schema: z.array(z.string()),
            example: [
              'genre-action', 'genre-comedy', 'console-ps4', 'color-red', 'color-blue' 
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
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example);
}


/**
 * @param {OpenAPIRegistry} registry 
 */
const register_quick_search = registry => {
  const _quickSearchResultSchema = registry.register('quickSearchResultSchema', quickSearchResultSchema);
  const _quickSearchResourceSchema = registry.register('quickSearchResourceSchema', quickSearchResourceSchema);

  const example = {
    "tags": [
      {
        "handle": "tokenbbbbbbbb",
        "id": "tag_66536ca06fa22e106f4e99b9"
      },
      {
        "handle": "tokenaaaaaaaa",
        "id": "tag_66536c9f6fa22e106f4e99b8"
      },
      {
          "handle": "tokenbbbb",
          "id": "tag_6653623d397c8a07129e1e92"
      },
      {
          "handle": "tokenaaaa",
          "id": "tag_6653623d397c8a07129e1e91"
      },
      {
          "handle": "token-bbbb",
          "id": "tag_665360bbcc581b05cfd79fc3"
      }
    ],
    "collections": [
        {
            "handle": "tokenbbbbbbbb",
            "title": "tokenbbbbbbbb",
            "id": "col_66536c9f6fa22e106f4e99b7"
        },
        {
            "handle": "tokenaaaaaaaa",
            "title": "tokenaaaaaaaa",
            "id": "col_66536c9d6fa22e106f4e99b6"
        },
        {
            "handle": "tokenbbbb",
            "title": "tokenbbbb",
            "id": "col_6653623c397c8a07129e1e90"
        },
        {
            "handle": "tokenaaaa",
            "title": "tokenaaaa",
            "id": "col_6653623b397c8a07129e1e8f"
        },
        {
            "handle": "token-bbbb",
            "title": "token-bbbb",
            "id": "col_665360bacc581b05cfd79fc1"
        }
    ],
    "customers": [
        {
            "id": "cus_664f2b647af10730331571c5"
        },
        {
            "id": "cus_664f2b637af10730331571c4"
        },
        {
            "id": "cus_663b247f63cbf825b6f798a9"
        }
    ],
    "products": [
        {
            "handle": "tokenbbbbbbbb",
            "title": "tokenbbbbbbbb",
            "id": "pr_66536c9b6fa22e106f4e99b5"
        },
        {
            "handle": "tokenaaaaaaaa",
            "title": "tokenaaaaaaaa",
            "id": "pr_66536c9a6fa22e106f4e99b4"
        },
        {
            "handle": "tokenbbbb",
            "title": "tokenbbbb",
            "id": "pr_66536239397c8a07129e1e8e"
        },
        {
            "handle": "tokenaaaa",
            "title": "tokenaaaa",
            "id": "pr_66536238397c8a07129e1e8d"
        },
        {
            "handle": "token-bbbb",
            "title": "token-bbbb",
            "id": "pr_665360b7cc581b05cfd79fbf"
        }
    ],
    "storefronts": [
        {
            "handle": "tokenbbbbbbbb",
            "title": "tokenbbbbbbbb",
            "id": "sf_66536ca36fa22e106f4e99bd"
        },
        {
            "handle": "tokenaaaaaaaa",
            "title": "tokenaaaaaaaa",
            "id": "sf_66536ca26fa22e106f4e99bc"
        },
        {
            "handle": "tokenbbbb",
            "title": "tokenbbbb",
            "id": "sf_66536240397c8a07129e1e96"
        },
        {
            "handle": "tokenaaaa",
            "title": "tokenaaaa",
            "id": "sf_6653623f397c8a07129e1e95"
        },
        {
            "handle": "token-bbbb",
            "title": "token-bbbb",
            "id": "sf_665360becc581b05cfd79fc7"
        }
    ],
    "images": [
        {
            "handle": "screenshot-2024-04-15-at-16-48-09-1716105936102-w-811-h-258-jpeg",
            "id": "img_6649b2f412ce1800730447cf"
        },
        {
            "handle": "img2-1712767181737-w-255-h-177-jpeg",
            "id": "img_6616c0fc33ca8a7087186908"
        },
        {
            "handle": "img1-1712767175888-w-383-h-369-jpeg",
            "id": "img_6616c0fc33ca8a7087186907"
        },
        {
            "handle": "screenshot-2023-08-30-at-10-14-12-1712767192277-w-399-h-400-jpeg",
            "id": "img_6616c0fc33ca8a7087186906"
        }
    ],
    "posts": [
        {
            "handle": "tokenbbbbbbbb",
            "title": "tokenbbbbbbbb",
            "id": "post_66536ca26fa22e106f4e99bb"
        },
        {
            "handle": "tokenaaaaaaaa",
            "title": "tokenaaaaaaaa",
            "id": "post_66536ca16fa22e106f4e99ba"
        },
        {
            "handle": "tokenbbbb",
            "title": "tokenbbbb",
            "id": "post_6653623f397c8a07129e1e94"
        },
        {
            "handle": "tokenaaaa",
            "title": "tokenaaaa",
            "id": "post_6653623e397c8a07129e1e93"
        },
        {
            "handle": "token-bbbb",
            "title": "token-bbbb",
            "id": "post_665360bdcc581b05cfd79fc5"
        }
    ],
    "shipping_methods": [
        {
            "handle": "ship-api-storefronts-all-connections-test-js-2",
            "title": "ship 2",
            "id": "ship_664f2c6d7af107303315722c"
        },
        {
            "handle": "ship-api-shipping-crud-test-js-2",
            "title": "ship 2",
            "id": "ship_664f2c587af1073033157226"
        },
        {
            "handle": "ship-api-shipping-crud-test-js-1",
            "title": "ship 1",
            "id": "ship_664f2c577af1073033157225"
        },
        {
            "handle": "ship-checkout-test",
            "title": "shipping checkout test",
            "id": "ship_664f2b3e7af10730331571b5"
        },
        {
            "title": "ship 2 duplicate",
            "handle": "ship-2-duplicate",
            "id": "ship_6640ffdb2e08aad3d6eae6cd"
        }
    ],
    "notifications": [
        {
            "id": "not_664f2bcd7af10730331571f4"
        },
        {
            "id": "not_664f2bcd7af10730331571f3"
        },
        {
            "id": "not_664f2bcd7af10730331571f2"
        },
        {
            "id": "not_664f2bcd7af10730331571f1"
        },
        {
            "id": "not_664f2bcd7af10730331571f0"
        }
    ],
    "discounts": [
        {
            "handle": "tokenbbbbbbbb",
            "title": "tokenbbbbbbbb",
            "id": "dis_66536ca56fa22e106f4e99bf"
        },
        {
            "handle": "tokenaaaaaaaa",
            "title": "tokenaaaaaaaa",
            "id": "dis_66536ca46fa22e106f4e99be"
        },
        {
            "handle": "tokenbbbb",
            "title": "tokenbbbb",
            "id": "dis_66536242397c8a07129e1e98"
        },
        {
            "handle": "tokenaaaa",
            "title": "tokenaaaa",
            "id": "dis_66536240397c8a07129e1e97"
        },
        {
            "handle": "token-bbbb",
            "title": "token-bbbb",
            "id": "dis_665360c1cc581b05cfd79fc9"
        }
    ],
    "orders": [
        {
            "id": "order_65e5ca42c43e2c41ae5216aa"
        },
        {
            "id": "order_65e5ca42c43e2c41ae5216a9"
        },
        {
            "id": "order_665365616fe75709e1cede5a"
        },
        {
            "id": "order_665365616fe75709e1cede59"
        },
        {
            "id": "order_66536403f33440088e759cce"
        }
    ],
    "templates": [
        {
            "handle": "template-api-templates-crud-test-js-2",
            "title": "template 2",
            "id": "template_664f2c877af1073033157237"
        },
        {
            "handle": "template-api-templates-crud-test-js-1",
            "title": "template 1",
            "id": "template_664f2c877af1073033157236"
        },
        {
            "title": "Checkout Complete",
            "handle": "checkout-complete",
            "id": "template_664b15174eba71b9ee185be5"
        },
        {
            "title": "templae 123",
            "handle": "templae-1",
            "id": "template_664624bbab446ee2f0e14eee"
        }
    ]
  }
  
  registry.registerPath({
    method: 'get',
    path: `/search`,
    summary: `Quickly search across resources`,
    description: 'List super lite search results with `id`, `handle`, `title`. Primarily used for quick and responsive lookup, this is cheap and cost-effective and works well in the dashboard. \
    If an `admin` is hitting the endpoint, then he can even get results for `orders`, `customer` and `auth_users`. \
    You can also use the `expand` in the query to efficiently control which resources are searched at the database',
    tags: ['search'],
    request: {
      query: create_query()
    },
    responses: {
      200: {
        description: `Search results`,
        content: {
          'application/json': {
            schema: _quickSearchResultSchema,
            example: [example]
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });
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

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example, '', apply_security()
  );
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    z.array(_typeUpsertSchema), example, 
    'Upsert Bulk `notifications`', 'Upsert Bulk notifications');
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example, apply_security()
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

  register_base_get(
    registry, slug_base, name, tags, example_id, 
    _typeSchema, example_order);
  register_base_upsert(
    registry, slug_base, name, tags, example_id, 
    _typeUpsertSchema, example_order
    );
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example_order, apply_security(),
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

  register_base_get(registry, slug_base, name, tags, example_id, _typeSchema, example_post);
  register_base_upsert(registry, slug_base, name, tags, example_id, _typeUpsertSchema, example_post);
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(registry, slug_base, name, tags, _typeUpsertSchema, example_post);
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

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/auto-generated`,
    description: 'You can fetch the default auto-generated storefront. This will fetch all active `collections`, \
    `discounts`, `shipping methods`, `posts` (latest 5) and `products`(latest 10) that are linked to the storefront. \
    Also, all the products tags aggregated so you can build a filter system in the frontend',
    summary: 'Get Default Auto Generated Storefront',
    tags,
    responses: {
      200: {
        description: `The default storefront`,
        content: {
          'application/json': {
            schema: storefrontTypeSchema,
            example
          },
        },
      },
      ...error() 
    },
  });
    
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
  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(
    registry, slug_base, name, tags, _typeUpsertSchema, example
    );

  registry.registerPath({
    method: 'post',
    path: `/${slug_base}/{id_or_handle}/export`,
    description: 'Export a storefront into the `storage`. This is beneficial for things`, that hardly change and therefore can be efficiently stored and retrieved from a cost-effective `storage` and **CDN** network.',
    summary: 'Export storefront to storage json',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
            description: '`id` or `handle` of the storefront'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `json url`,
        content: {
          'application/json': {
            schema: z.string().describe('storage path of the exported storefront'),
            example: ['storage://storefronts/sf_65dc619ac40344c9a1dd6755.json', 'storage://storefronts/weekday-storefront.json']
          },
        },
      },
      ...error() 
    },
    ...apply_security()    
  });
  
  
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
            example: example_id,
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
            example: [example_product, example_product]
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
            example: example_id,
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
            example: [example_discount]
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
            example: example_id,
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
            example: [example_shipping]
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
            example: example_id,
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
            example: [example_collection]
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
            example: example_id,
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
            example: [example_post]
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
const register_payments = registry => {
  const name = 'storefront'
  const tags = ['payments gateways'];
  const example_id = 'sf_65dc619ac40344c9a1dd6755';
  const paymentGatewayItemGet = registry.register(
    'paymentGatewayItemGet', paymentGatewayItemGetSchema
  );

  const paymentGatewayStatus = registry.register(
    'paymentGatewayStatus', paymentGatewayStatusSchema
  );

  const example_get = {
    "config": {
      "default_currency_code": "USD",
      "env": "prod",
      "intent_on_checkout": "AUTHORIZE",
      "client_id": "client_id",
      "secret": "secret"
    },
    "info": {
      "name": "Paypal standard payments",
      "description": "Set up standard payments to present payment buttons \
      to your payers so they can pay with PayPal, debit and credit cards, \
      Pay Later options, Venmo, and alternative payment methods.\n      \
      You can get started quickly with this 15-minute copy-and-paste integration. \
      If you have an older Checkout integration, you can upgrade your Checkout integration.",
      "url": "https://developer.paypal.com/docs/checkout/standard/",
      "logo_url": "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
    },
    "handle": "paypal_standard",
    "actions": [
      {
        "handle": "capture",
        "name": "Capture",
        "description": "Capture an authorized payment"
      },
      {
        "handle": "void",
        "name": "Void",
        "description": "Cancel an authorized payment"
      },
      {
        "handle": "refund",
        "name": "Refund",
        "description": "Refund a captured payment"
      }
    ]
  }

  const example_status = {
    "actions": [
      {
        "handle": "capture",
        "name": "Capture",
        "description": "Capture an authorized payment"
      },
      {
        "handle": "void",
        "name": "Void",
        "description": "Cancel an authorized payment"
      },
      {
        "handle": "refund",
        "name": "Refund",
        "description": "Refund a captured payment"
      }
    ],
    "messages": [
      "200USD were tried to be Captured",
      "The capture is COMPLETE",
      "date is ..."
    ]
  }  

  registry.registerPath({
    method: 'get',
    path: `/payments/gateways/{gateway_handle}`,
    description: `Get a Payment Gateway data by its \`handle\``,
    summary: `Get a payment gateway`,
    tags,
    request: {
      params: z.object({
        gateway_handle: z.string().openapi(
          { 
            description: `The \`handle\` of gateway`
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `Object with gateway data.`,
        content: {
          'application/json': {
            schema: paymentGatewayItemGet,
            example: example_get
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });

  registry.registerPath({
    method: 'get',
    path: `/payments/gateways`,
    description: `List payment gateways`,
    summary: `List payment gateways`,
    tags,
    responses: {
      200: {
        description: `Object with gateway data.`,
        content: {
          'application/json': {
            schema: z.array(paymentGatewayItemGet),
            example: [example_get]
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });
  
  registry.registerPath({
    method: 'post',
    path: `/payments/gateways/{gateway_handle}/webhook`,
    summary: `Webhook for payment`,
    description: `Webhook endpoint for a payment gateway`,
    tags,
    request: {
      params: z.object({
        gateway_handle: z.string().openapi(
          { 
            description: `The \`handle\` of the payment gateway`
          }
        ),
      }),
    },
    responses: {
    },
  });  


  registry.registerPath({
    method: 'get',
    path: `/payments/status/{order_id}`,
    description: `Get the payment status of an order`,
    summary: `Get the payment status of an order`,
    tags,
    request: {
      params: z.object({
        order_id: z.string().openapi(
          { 
            description: `The \`id\` of the order`
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `Object with status data.`,
        content: {
          'application/json': {
            schema: paymentGatewayStatus,
            example: example_status
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });  
 
  registry.registerPath({
    method: 'get',
    path: `/payments/buy_ui/{order_id}`,
    summary: `Get a Pay UI`,
    description: `First, make sure, that checkout creation took place. either through the rest-api or through the dashboard`,
    tags,
    request: {
      params: z.object({
        order_id: z.string().openapi(
          { 
            description: `The \`id\` of the order`
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `HTML you can use to complete a checkout`,
      },
      ...error() 
    },
  });  

  
  registry.registerPath({
    method: 'post',
    path: `/payments/{action_handle}/{order_id}`,
    description: `Payment gateways support custom actions to complete things such as \`capture / refund / etc\`, \
    This endpoint, will fetch the order, lookup the matched payment gateway and invoke the specified \
    \`action\` in the gateway`,
    summary: `Invoke a payment gateway action`,
    tags,
    request: {
      params: z.object({
        action_handle: z.string().openapi(
          { 
            description: `The \`handle\` of the action supported by the payment gateway, that processed this order`
          }
        ),
        order_id: z.string().openapi(
          { 
            description: `The \`id\` of the order`
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `Object with status data.`,
        content: {
          'application/json': {
            schema: paymentGatewayStatusSchema,
            example: example_status
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });  

}

/**
 * @param {OpenAPIRegistry} registry 
 */
const register_extensions = registry => {
  const slug_base = 'extensions'
  const tags = ['extensions'];
  const example_id = 'sf_65dc619ac40344c9a1dd6755';
  const _extensionItemGetSchema = registry.register(
    'extensionItemGet', extensionItemGetSchema
  );

  const example_get = {
    "config": {
      "default_currency_code": "USD",
      "env": "prod",
      "intent_on_checkout": "AUTHORIZE",
      "client_id": "client_id",
      "secret": "secret"
    },
    "info": {
        "name": "Paypal standard payments",
        "description": "Set up standard payments to present payment buttons \
        to your payers so they can pay with PayPal, debit and credit cards, \
        Pay Later options, Venmo, and alternative payment methods.\n      \
        You can get started quickly with this 15-minute copy-and-paste integration. \
        If you have an older Checkout integration, you can upgrade your Checkout integration.",
        "url": "https://developer.paypal.com/docs/checkout/standard/",
        "logo_url": "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
    },
    "handle": "paypal_standard",
    "actions": [
        {
            "handle": "capture",
            "name": "Capture",
            "description": "Capture an authorized payment"
        },
        {
            "handle": "void",
            "name": "Void",
            "description": "Cancel an authorized payment"
        },
        {
            "handle": "refund",
            "name": "Refund",
            "description": "Refund a captured payment"
        }
    ]
  }


  registry.registerPath({
    method: 'get',
    path: `/extensions/{handle}`,
    description: `Get extension data by its \`handle\``,
    summary: `Get extension`,
    tags,
    request: {
      params: z.object({
        handle: z.string().openapi(
          { 
            description: `The \`handle\` of the extension`
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `Object with extension data.`,
        content: {
          'application/json': {
            schema: _extensionItemGetSchema,
            example: example_get
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });


  registry.registerPath({
    method: 'get',
    path: `/extensions`,
    description: `List all extensions`,
    summary: `List all extensions`,
    tags,
    responses: {
      200: {
        description: `array of extension data`,
        content: {
          'application/json': {
            schema: z.array(_extensionItemGetSchema),
            example: [example_get]
          },
        },
      },
      ...error() 
    },
    ...apply_security()
  });
  

  registry.registerPath({
    method: 'post',
    path: `/extensions/{extension_handle}/{action_handle}`,
    description: 'Invoke an `action` of extension',
    summary: `Invoke action`,
    tags,
    request: {
      params: z.object({
        extension_handle: z.string().openapi(
          { 
            description: `The \`handle\` of the extension`
          }
        ),
        action_handle: z.string().openapi(
          { 
            description: `The \`handle\` of the action`
          }
        ),
      }),
      body: {
        content: { "application/json": { schema:z.any() }},
        description: 'The payload the specific action of the extension expects'
      }
    },
    responses: {
      200: {
        description: `Object with status data.`,
        content: {
          'application/json': {
            schema: z.any(),
          },
        },
      },
      ...error() 
    },
    ...apply_security()
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

  // update product's stock
  registry.registerPath({
    method: 'put',
    path: `/${slug_base}/{product_id_or_handle}?quantityBy={quantityBy}`,
    summary: `Update stock quantity of a product`,
    description: 'Update stock quantity of a product by a diff number',
    tags,
    request: {
      query: z.object({
        quantityBy: z.number().openapi(
          { 
            examples: [2, -1, 3, -4],
            description: 'A delta (difference) number by how much to update the stock. May be `positive` / `negative` **integer**',
          }
        ),
      }),
      params: z.object({
        product_id_or_handle: z.string().openapi(
          { 
            examples: [example_id, 'white-shirt-xl'],
            description: 'A product `handle` or `id`',
          }
        ),
      })
    },
    responses: {
      200: {
        description: 'ok',
      },
      ...error() 
    },
    ...apply_security()
  });


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

  register_base_delete(registry, slug_base, name, tags, example_id);
  register_base_list(
    registry, slug_base, name, tags, 
    _typeUpsertSchema, example
    );

  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/used_tags`,
    description: 'List all of the used tags of all the products, This is helpful for building a filter system in the frontend if you know in advance all the tags of the products in a collection, also see the collection confined version db_collections.list_collection_products_tags',
    summary: 'List all used tags',
    tags,
    responses: {
      200: {
        description: `List of all of the tags of all the products`,
        content: {
          'application/json': {
            schema: z.array(z.string()),
            example: [
              'genre-action', 'genre-comedy', 'console-ps4', 'color-red', 'color-blue' 
            ]
          },
        },
      },
      ...error() 
    },
  });
  
  
  // list collections
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/collections`,
    description: 'Each `products` has linked collections, you can list all these `collections`',
    summary: 'List collections of product',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
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
            example: [example_collection]
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
    summary: 'List variants of product',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
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
    summary: 'List discounts of product',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
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
            example: [example_discount]
          },
        },
      },
      ...error() 
     },
  });

  // list related products
  registry.registerPath({
    method: 'get',
    path: `/${slug_base}/{id_or_handle}/related`,
    description: 'Each `products` may have related `products`, you can list all these `products`',
    summary: 'List related products of product',
    tags,
    request: {
      params: z.object({
        id_or_handle: z.string().openapi(
          { 
            example: example_id,
            description: '`id` or `handle`'
          }
        ),
      }),
    },
    responses: {
      200: {
        description: `List all related products`,
        content: {
          'application/json': {
            schema: z.array(discountTypeSchema),
            example: [example_product]
          },
        },
      },
      ...error() 
     },
  });

}

//

create_all();