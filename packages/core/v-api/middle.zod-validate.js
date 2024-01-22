import { ZodSchema } from 'zod'

/**
 * @param {ZodSchema} zod_schema
 */
export const zod_validate_body = (zod_schema) => {
  /**
   * @param {import("../types.public").ApiRequest} req
   * @param {import("../types.public").ApiResponse} res
   */
  return async (req, res) => {

    const result = zod_schema.safeParse(
      req.parsedBody
    );
    
    if(!result.success) {
      /** @type {import("zod").SafeParseError<any>} */
      const casted = result;
      throw { message: casted.error?.issues, code: 400 };
    };
    
  }
}
