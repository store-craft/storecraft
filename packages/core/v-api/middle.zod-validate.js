import { ZodSchema } from 'zod'

/**
 * @param {ZodSchema} zod_schema
 * @param {any} item
 */
export const assert_zod = (zod_schema, item) => {
  const result = zod_schema.safeParse(item);
  
  if(!result.success) {
    /** @type {import("zod").SafeParseError<any>} */
    const casted = result;
    throw { message: casted.error?.issues, code: 400 };
  };
}

/**
 * @param {ZodSchema} zod_schema
 */
export const zod_validate_body = (zod_schema) => {
  /**
   * @param {import("../types.public").ApiRequest} req
   * @param {import("../types.public").ApiResponse} res
   */
  return async (req, res) => {
    assert_zod(zod_schema, req.parsedBody);
  }
}
