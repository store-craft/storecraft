/**
 * @import { Tool } from './types.private.js'
 */

import { z } from 'zod';

/**
 * @description Helper method to give typescript a context to infer tools parameters.
 * This is helpful when adding a tool in an `Tool<any>` typed property or writing
 * a tool without needing to type it's `zod`. This helps to ground in-place tool
 * writing and also helps with correctness of tools type with the `use` method
 * 
 * @template {z.ZodTypeAny} [Result=any]
 * @template {z.ZodTypeAny} [Params=any]
 * 
 * @param {Tool<Params, Result>} tool
 */
export const tool = (tool) => {
  return tool;
}

/**
 * 
 * @param {Tool} tool
 * @param {object} input 
 * @returns {Promise<{ result: any} | { error: any}>}
 */
export const invoke_tool_safely = async (tool, input) => {
  try {
    return {
      result: await tool.use(input)
    }
  } catch (e) {
    return {
      error: e
    }
  }
}