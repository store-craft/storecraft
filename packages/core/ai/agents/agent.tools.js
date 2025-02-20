import { z } from "zod"
import { tool } from "../core/tools.js"

export const TOOLS = {
  search_products: tool(
    {
      title: '**searching** in `products`',
      schema: {
        description: 'Search products of the store for info like pricing, discounts and collections',
        parameters: z.object(
          {
            query: z.string().describe('search keywords, can also use boolean notation for inclusion and exlusion'),
            count: z.number().describe('how many search results to query, default to 5')
          }
        )
      },
      use: async function (input) {
        return [
          {
            title: 'super mario NES game',
            price: 100
          }
        ]
      }
    }
  )
}