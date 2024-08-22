import { select, input, confirm } from "@inquirer/prompts";

export const options = /** @type {const} */ ({
  node: {
    name: 'Node Local Storage',
    value: 'node',
  },
  deno: {
    name: 'Deno Local Storage',
    value: 'deno',
  },
  bun: {
    name: 'Bun Local Storage',
    value: 'bun',
  },
  cloudflare_r2: {
    name: 'Cloudflare R2 (cloud)',
    value: 'cloudflare_r2',
  },
  aws_s3: {
    name: 'AWS S3 (cloud)',
    value: 'aws_s3',
  },
  s3_compatible: {
    name: 'S3 compatible (cloud)',
    value: 's3_compatible',
  },
  google_storage: {
    name: 'Google Storage (cloud)',
    value: 'google_storage',
  },
});


export const collect_database = async () => {

  const id = await select(
    {
      message: '📦 Select Storage (for images and assets)',
      choices: Object.entries(dbs).map(it => it[1]),
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
 * @param {options[keyof typeof options]["value"]} id 
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
          message: 'Enter local folder path',
          required: true,
        }
      );

      return config;
    }

    case 'cloudflare_r2': {
      /** @type {ConstructorParameters<import('@storecraft/storage-s3-compatible').R2>} */
      const config = await input(
        { 
          message: 'Enter local folder path',
          required: true,
        }
      );

      return config;
    }

      
  }

}