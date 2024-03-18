import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { parse, stringify as YAMLStringify } from 'yaml'
import {
  tagTypeSchema, tagTypeUpsertSchema
} from '../v-api/types.autogen.zod.api.js'
import * as path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

extendZodWithOpenApi(z);
const registry = new OpenAPIRegistry();

// Register definitions here

const _tagTypeSchema = registry.register('Tag', tagTypeSchema.describe('hola'));
const _tagTypeUpsertSchema = registry.register('TagUpsert', tagTypeUpsertSchema);
registry.registerPath({
  method: 'get',
  path: '/tags/{id_or_handle}',
  description: 'Get tag data by its id or handle',
  summary: 'Get a single tag',
  request: {
    params: z.object({
      id_or_handle: z.string().openapi({ example: 'tag_djsidisjdisd or genre' }),
    }),
  },
  responses: {
    200: {
      description: 'Object with user data.',
      content: {
        'application/json': {
          schema: _tagTypeSchema,
        },
      },
    },
    204: {
      description: 'No content - successful operation',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/tags',
  description: 'upsert a tag',
  summary: 'upsert a single tag',
  request: {
    body: {
      content: {
        "application/json": {
          schema: _tagTypeUpsertSchema,
        },
      },
      description: 'blah description'
    }
  },
  responses: {
    200: {
      description: 'ID of upserted data',
      content: {
        "application/json": {
          schema: z.string(),
        },
      },
    },
    204: {
      description: 'No content - successful operation',
    },
  },
});
//

const generator = new OpenApiGeneratorV3(registry.definitions);
const out = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'StoreCraft API',
    description: 'This is the API',
  },
  servers: [{ url: 'v1' }],
  security: []
});

writeFile(
  path.join(__dirname, 'docs.openapi.yaml'), 
  YAMLStringify(out)
);

writeFile(
  path.join(__dirname, 'openapi.json'), 
  JSON.stringify(out)
);

console.log(JSON.stringify(out, null, 2))
// return generator.generateComponents();
