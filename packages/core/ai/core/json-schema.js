import { z } from 'zod'

/**
 * 
 * @param {Object} o 
 * @param {z.ZodTypeAny} zod 
 */
const with_description = (o, zod) => {
  if(zod.description)
    o.description = zod.description;

  return o;
}

/**
 * @template {z.ZodTypeAny} T 
 * @param {T} schema 
 */
export const zod_to_json_schema = (schema) => {
  // make sure schema is not null or undefined
  if (schema === null || schema === undefined) return null;

  // check if schema is nullable or optional
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) 
    return zod_to_json_schema(schema.unwrap());

  // check if schema is an array
  if (schema instanceof z.ZodArray) {
    return with_description(
      {
        type: 'array',
        items: zod_to_json_schema(schema.element)
      }, schema
    )
  }

  // check if schema is an object
  if (schema instanceof z.ZodObject) {
    // get key/value pairs from schema
    const entries = Object.entries(schema.shape);
    // loop through key/value pairs
    return {
      "properties": Object.fromEntries(
        entries.map(
          ([key, value]) => {
            // get nested keys
            const nested = zod_to_json_schema(value);
            return [key, zod_to_json_schema(value)];
          }
        )
      ),
      "type": "object"
    }
  }

  if (schema instanceof z.ZodNumber) 
    return with_description(
      { type: 'number', description: schema.description}, schema
    );

  if (schema instanceof z.ZodString) 
    return with_description(
      { type: 'string', description: schema.description}, schema
    );

  // return empty array
  return {
    type: "unsupported"
  };
};