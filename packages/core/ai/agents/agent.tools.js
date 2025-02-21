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
  ),

  login_frontend: tool(
    {
      title: 'Sending login form',
      schema: {
        description: 'This will send a form to the customer with login inputs, so he can fill his credentials at the frontend side',
        parameters: z.object(
          {
            message: z.string().describe('sends message to customer with the form'),
          }
        )   
      },
      use: async function (input) {
        return [
          {
            message: input.message,
            form_type: 'login'
          }
        ]
      }
    }
  )
}