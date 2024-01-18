import { ZodError, ZodSchema } from "zod"

/**
 * @param {ZodSchema} zod_schema
 */
export const zod_validate_body = (zod_schema) => {
  /**
   * @param {import("../types.public").VPolkaRequest} req
   * @param {import("../types.public").VPolkaResponse} res
   */
  return async (req, res) => {
    const result = zod_schema.safeParse(
      req.parsedBody
    );
    
    if(!result.success) {
      /** @type {import("zod").SafeParseError<any>} */
      const casted = result;
      console.log(casted)
      const errors = casted.error.issues.map(
        issue => (
          {
            message: `${issue.path}: ${issue.message}`
          }
        )
      );

      throw { message: errors, code: 400 };
    }
  }
}
