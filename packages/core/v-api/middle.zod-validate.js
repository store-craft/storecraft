import { ZodSchema } from 'zod'
import { StorecraftError } from './utils.func.js';

/**
 * @param {ZodSchema} zod_schema
 * @param {any} item
 */
export const assert_zod = (zod_schema, item) => {
  const result = zod_schema.safeParse(item);
  
  if(!result.success) {
    /** @type {import("zod").SafeParseError<any>} */
    const casted = result;

    // console.log(JSON.stringify(casted.error?.issues, null, 2))

    throw new StorecraftError(casted.error?.issues, 400);
  };
}

/**
 * @param {ZodSchema} zod_schema
 */
export const zod_validate_body = (zod_schema) => {
  /**
   * @param {import("../types.public.js").ApiRequest} req
   * @param {import("../types.public.js").ApiResponse} res
   */
  return async (req, res) => {
    assert_zod(zod_schema, req.parsedBody);
  }
}
