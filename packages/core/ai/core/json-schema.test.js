import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { zod_to_json_schema } from './json-schema.js';
import { z } from 'zod';

const test_cases = [
  {
    zod: z.object(
      {
        q: z.string().describe("The human query, example 'I am looking for a red dress', `I am looking for a discount on a red dress`"),
        namespaces: z.array(z.enum(["products", "collections", "shipping", "discounts", "all"])).describe("The namespaces to search in"),
        limit: z.number().optional().describe("Limit the results").default(5)
      }
    ),
    expected: {
      "properties": {
        "q": {
          "type": "string",
          "description": "The human query, example 'I am looking for a red dress', `I am looking for a discount on a red dress`"
        },
        "namespaces": {
          "type": "array",
          "items": {
            "type": "string",
            "enums": [
              "products",
              "collections",
              "shipping",
              "discounts",
              "all"
            ]
          },
          "description": "The namespaces to search in"
        },
        "limit": {
          "type": "number",
          "description": "Limit the results"
        }
      },
      "type": "object"
    }
  }
]

test(
  'zod_to_json_schema', 
  () => {    
    for(const test_case of test_cases) {
      const json_schema = zod_to_json_schema(test_case.zod);
      // console.log(JSON.stringify(json_schema, null, 2));
      assert.equal(
        JSON.stringify(json_schema, null, 2),
        JSON.stringify(test_case.expected, null, 2),
        'zod_to_json_schema did not return the expected result'
      )
    }

  }
);

test.run();