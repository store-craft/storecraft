/**
 * @import { SafeParseError } from 'zod'
 * @import { ApiRequest, ApiResponse } from '../rest/types.public.js'
 * 
 */
import { ZodSchema } from 'zod'
import { StorecraftError } from './utils.func.js';


/**
 * @description remove all undefined and null values from object
 * @param {object} o 
 */
export const sanitize = o => {
  for(let key in o) {
    const v = o[key];
    if(v===undefined || v===null) {
      delete o[key];
    } else if(typeof v==='object') {
      sanitize(o[key])
    }
  }
}

/**
 * @description assert that an item is valid against a zod schema
 * @param {ZodSchema} zod_schema
 * @param {any} item
 */
export const assert_zod = (zod_schema, item) => {
  sanitize(item);

  const result = zod_schema.safeParse(item);
  
  if(!result.success) {
    
    const casted = (/** @type {SafeParseError<any>} */ (result));

    // console.log(JSON.stringify(casted.error?.issues, null, 2))

    throw new StorecraftError(casted.error?.issues, 400);
  };
}

/**
 * @description middleware to validate the request body against a zod schema
 * @param {ZodSchema} zod_schema
 */
export const zod_validate_body = (zod_schema) => {
  /**
   * @param {ApiRequest} req
   * @param {ApiResponse} res
   */
  return async (req, res) => {
    assert_zod(zod_schema, req.parsedBody);
  }
}
