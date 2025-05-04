/**
 * @import { Tool } from './types.private.js'
 */
import { z } from 'zod';

const c = {
  red: '\x1b[1;31m',
  green: '\x1b[1;32m',
  cyan: '\x1b[36m',
  magenta: `\x1b[1;35m`,
  yellow: `\x1b[33m`,
  reset: `\x1b[0m`,
}

const method_to_color = {
  'get': `\x1b[1;43;37mGET\x1b[0m`,
  'GET': `\x1b[1;43;37mGET\x1b[0m`,
  'post': `\x1b[1;44;37mPOST\x1b[0m`,
  'POST': `\x1b[1;44;37mPOST\x1b[0m`,
  'put': `\x1b[1;44;37mPUT\x1b[0m`,
  'PUT': `\x1b[1;44;37mPUT\x1b[0m`,
  'patch': `\x1b[1;44;37mPATCH\x1b[0m`,
  'PATCH': `\x1b[1;44;37mPATCH\x1b[0m`,
  'delete': `\x1b[1;41;37mDELETE\x1b[0m`,
  'DELETE': `\x1b[1;41;37mDELETE\x1b[0m`,
  'options': `\x1b[1;45;37mOPTIONS\x1b[0m`,
  'OPTIONS': `\x1b[1;45;37mOPTIONS\x1b[0m`,
}


/**
 * @description Helper method to give typescript a context to infer tools parameters.
 * This is helpful when adding a tool in an `Tool<any>` typed property or writing
 * a tool without needing to type it's `zod`. This helps to ground in-place tool
 * writing and also helps with correctness of tools type with the `use` method
 * 
 * @template {any} [Result=any]
 * @template {z.ZodTypeAny} [Params=any]
 * 
 * @param {Tool<Params, Result>} tool
 * @returns {Tool<Params, Result>} tool
 */
export const tool = (tool) => {
  // middleware for logging tool usage
  const use = async (any) => {
    console.log(`\x1b[1;45;37mTOOL USE\x1b[0m \x1b[1;37m${tool.title}\x1b[0m`);
    console.log(any);
    // console.log(`${JSON.stringify(any, null, 2)}`);

    const result = await tool.use(any);

    console.log(`\x1b[1;42;37mTOOL RESULT\x1b[0m \x1b[0m \x1b[1;37m${tool.title}\x1b[0m`);
    console.log(
      JSON.stringify(result, null, 2)
          ?.split('\n').slice(0, 5)
          .join('\n') + '\n......'
    );
    
    return result;
  }
  return {
    ...tool,
    use
  };
}

/**
 * 
 * @param {Tool} tool
 * @param {object} input 
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