import { z } from 'zod';

export { OpenAI } from './openai/index.js' ;

/**
 * @description Helper method to give typescript a context to infer tools parameters.
 * This is helpful when adding a tool in an `Tool<any>` typed property or writing
 * a tool without needing to type it's `zod`. This helps to ground in-place tool
 * writing and also helps with correctness of tools type with the `use` method
 * 
 * @template {z.ZodTypeAny} [Params=any]
 * @template {any} [Result=any]
 * 
 * @param {import('./types.js').Tool<Params, Result>} tool
 */
export const tool = (tool) => {
  return tool;
}