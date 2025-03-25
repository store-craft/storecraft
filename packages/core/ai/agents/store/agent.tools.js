import { z } from "zod"
import { tool } from "../../core/tools.js"
import { 
  collectionTypeSchema,
  productTypeSchema, shippingMethodTypeSchema, 
  similaritySearchInputSchema
} from '@storecraft/core/api/types.autogen.zod.api.js'
import { App } from "../../../index.js"
import { assert } from "../../../api/utils.func.js"

export const sleep = (ms=100) => {
  return new Promise(
    (resolve, reject) => {
      setTimeout(
        resolve, ms
      )
    }
  )
}

/**
 * 
 * @param {{ app: App}} context Storecraft app instance
 */
export const TOOLS = (context) => {

  return {

    search_products: tool(
      {
        title: '**searching** in `products`',
        description: 'Search products of the store for info like pricing, discounts and collections',
        schema: z.object(
          {
            query: z.string().describe('search keywords, can also use boolean notation for inclusion and exlusion such as "tag:action | tag:survival"'),
            collection_handle: z.string().describe('Optional collection handle to search in, otherwise search in all collections'),
            count: z.number().describe('how many search results to query, default to 5')
          }
        ),
        schema_result_zod: z.array(productTypeSchema.partial()),
        use: async function (input) {

          if(input.collection_handle) {
            return context.app.api.collections.list_collection_products(
              input.collection_handle,
              {
                vql: input.query,
                limit: input.count
              }
            );
          }
          return context.app.api.products.list(
            {
              vql: input.query,
              limit: input.count
            }
          );
        }
      }
    ),

    
    // search_products_in_collection: tool(
    //   {
    //     title: '**searching** for `products` in a collection',
    //     description: 'Search for products inside a specific collection for info like pricing, discounts etc..',
    //     schema: z.object(
    //       {
    //         query: z.string().optional().describe('Optional search keywords, can also use boolean notation for inclusion and exlusion such as "tag:action | tag:survival" "'),
    //         collection_handle: z.string().describe('The handle or unique id of the collection in which to search the products'),
    //         count: z.number().describe('how many search results to query, default to 5')
    //       }
    //     ),
    //     schema_result_zod: z.array(productTypeSchema.partial()),
    //     use: async function (input) {

    //       const items = await context.app.api.collections.list_collection_products(
    //         input.collection_handle,
    //         {
    //           vql: input.query,
    //           limit: input.count
    //         }
    //       );

    //       return items;
    //     }
    //   }
    // ),


    search_with_similarity: tool(
      {
        title: '**similarity searching**',
        description: 'Search with semantic similarity for products, collections, shipping methods and discounts',
        schema: z.object({
          q: z.string().describe("The human query, example 'I am looking for a red dress', `I am looking for a discount on a red dress`"),
          namespaces: z.array(z.enum(["products", "collections", "shipping", "discounts", "all"])).describe("The namespaces to search in order to refine the search. Always use this to limit the search to a specific namespace"),
          limit: z.number().describe("Limit the top-k search results, default 5")
        }),
        use: async function (input) {

          const result = await context.app.api.search.similarity(
            {
              namespaces: ['all'],
              q: undefined,
              ...input
            }
          );

          return result.items;

        }
      }
    ),

    
    fetch_shipping_methods: tool(
      {
        title: '**fetching** `shipping methods`',
        description: 'Fetch all active shipping methods offered by the store',
        schema: z.object({}),
        schema_result_zod: z.array(shippingMethodTypeSchema.partial()),
        use: async function (input) {
          const shipping_methods = await context.app.api.shipping_methods.list(
            {
              equals: [['active', true]],
              limit: 10
            }
          );

          return shipping_methods;
        }
      }
    ),


    fetch_collections: tool(
      {
        title: '**fetching** `collections`',
        description: 'Fetch all active product collections offered by the store',
        schema: z.object({}),
        schema_result_zod: z.array(collectionTypeSchema.partial()),
        use: async function (input) {
          const items = await context.app.api.collections.list(
            {
              equals: [['active', true]],
              limit: 10
            }
          );

          return items;
        }
      }
    ),


    browse_collection: tool(
      {
        title: '**showing** `collection`',
        description: 'Send a command to the frontend to render a collection browser in the frontend',
        schema: z.object(
          {
            handle: z.string().describe('The handle or unique id of the collection to fetch'),
          }
        ),
        use: async function (input) {
          return (
            {
              command: /** @type {const} */ ('browse_collection'),
              params: {
                handle: input.handle 
              }
            }
          )
        }
      }
    ),    


    fetch_discounts: tool(
      {
        title: '**fetching** `discounts`',
        description: 'Fetch all active automatic discounts offered by the store',
        schema: z.object({}),
        schema_result_zod: z.array(collectionTypeSchema.partial()),
        use: async function (input) {
          const items = await context.app.api.discounts.list(
            {
              equals: [['active', true]],
              limit: 10
            }
          );

          return items;
        }
      }
    ),

    
    login_frontend: tool(
      {
        title: 'Sending login form',
        description: 'This will send a form to the customer with login inputs, so he can fill his credentials at the frontend side',
        schema: z.object(
          {
            message: z.string().describe('sends message to customer with the form'),
          }
        ),
        use: async function (input) {
          return {
            command: 'show_login_form',
            params: {
              message: input.message,
            }
          }
        }
      }
    )
  }
}