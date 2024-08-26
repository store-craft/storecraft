import { select, input, confirm } from "@inquirer/prompts";

/** @satisfies {import("../../utils.js").Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'Node Local Storage',
    value: 'node',
  },
  {
    name: 'Deno Local Storage',
    value: 'deno',
  },
  {
    name: 'Bun Local Storage',
    value: 'bun',
  },
  {
    name: 'Cloudflare R2 (cloud)',
    value: 'cloudflare_r2',
  },
  {
    name: 'AWS S3 (cloud)',
    value: 'aws_s3',
  },
  {
    name: 'S3 compatible (cloud)',
    value: 's3_compatible',
  },
  {
    name: 'Google Storage (cloud)',
    value: 'google_storage',
  },
]);


export const collect_storage = async () => {

  const id = await select(
    {
      message: '📦 Select Storage (for images and assets)',
      choices,
      loop: true,
    }
  );

  return {
    type: 'storage',
    id: id,
    config: await collect_general_config(id)
  };
}

/**
 * 
 * @param {choices[number]["value"]} id 
 * @returns 
 */
const collect_general_config = async (
  id
) => {
  switch(id) {
    case 'node':
    case 'deno':
    case 'bun': {
      /** @type {import('@storecraft/storage-local/node').Config} */
      const config = await input(
        { 
          message: 'Local folder path',
          required: true,
        }
      );

      return config;
    }

    case 'cloudflare_r2': {
      /** @type {import('@storecraft/storage-s3-compatible').R2Config} */
      const config = {
        account_id: await input(
          { 
            message: 'Cloudflare Account ID',
            required: true,
          }
        ),
        bucket: await input(
          { 
            message: 'Bucket ID',
            required: true,
          }
        ),
        accessKeyId: await input(
          { 
            message: 'Access Key ID',
            required: true,
          }
        ),
        secretAccessKey: await input(
          { 
            message: 'Secret Access Key',
            required: true,
          }
        ),
      }

      return config;
    }

    case 'aws_s3': {
      /** @type {import('@storecraft/storage-s3-compatible').AwsS3Config} */
      const config = {
        region: await input(
          { 
            message: 'Region',
            required: true,
          }
        ),
        bucket: await input(
          { 
            message: 'Bucket ID',
            required: true,
          }
        ),
        forcePathStyle: await confirm(
          { 
            message: 'Force Path Style',
            default: true,
          }
        ),
        accessKeyId: await input(
          { 
            message: 'Access Key ID',
            required: true,
          }
        ),
        secretAccessKey: await input(
          { 
            message: 'Secret Access Key',
            required: true,
          }
        ),
      }

      return config;
    }

    case 's3_compatible': {
      /** @type {import('@storecraft/storage-s3-compatible').Config} */
      const config = {
        endpoint: await input(
          { 
            message: 'Endpoint',
            required: true,
          }
        ),
        region: await input(
          { 
            message: 'Region',
            required: true,
            default: 'auto'
          }
        ),
        bucket: await input(
          { 
            message: 'Bucket ID',
            required: true,
          }
        ),
        forcePathStyle: await confirm(
          { 
            message: 'Force Path Style',
            default: true,
          }
        ),
        accessKeyId: await input(
          { 
            message: 'Access Key ID',
            required: true,
          }
        ),
        secretAccessKey: await input(
          { 
            message: 'Secret Access Key',
            required: true,
          }
        ),
      }

      return config;
    }

    case 'google_storage': {
      /** @type {import('@storecraft/storage-google').Config} */
      const config = {
        bucket: await input(
          { 
            message: 'Bucket ID',
            required: true,
          }
        ),
        client_email: await input(
          { 
            message: 'Client Email',
            required: true,
          }
        ),
        private_key_id: await input(
          { 
            message: 'Private Key ID',
            required: true,
          }
        ),
        private_key: await input(
          { 
            message: 'Private Key',
            required: true,
          }
        ),
      }

      return config;
    }
      
  }

}