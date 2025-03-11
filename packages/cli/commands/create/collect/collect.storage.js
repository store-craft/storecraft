/**
 * @import { Choice } from '../../utils.js';
 */
import {
  intro,
  outro,
  confirm,
  select,
  spinner,
  isCancel,
  cancel,
  text, 
} from '@clack/prompts';
import { required, withCancel } from './collect.utils.js';

/** @satisfies {Choice[]} */
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

  const id = await withCancel(
    select(
      {
        message: '📦 Select Storage (for images and assets)',
        options: choices.map(
          c => (
            {
              value: c.value,
              label: c.name
            }
          )
        ),
      }
    )
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
      /** @type {import('@storecraft/core/storage/node').Config} */
      const config = await withCancel(
        text(
          { 
            message: 'Storage Local folder path',
            defaultValue: 'storage',
            placeholder: 'storage',
          }
        )
      )

      return config;
    }

    case 'cloudflare_r2': {
      /** @type {import('@storecraft/storage-s3-compatible').R2Config} */
      const config = {
        account_id: await withCancel(
          text(
            { 
              message: 'Cloudflare Account ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        bucket: await withCancel(
          text(
            { 
              message: 'R2 Bucket ID',
              validate: required,
            }
          ),
        ),
        accessKeyId: await withCancel(
          text(
            { 
              message: 'R2 Access Key ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        secretAccessKey: await withCancel(
          text(
            { 
              message: 'R2 Secret Access Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        )
      }

      return config;
    }

    case 'aws_s3': {
      /** @type {import('@storecraft/storage-s3-compatible').AwsS3Config} */
      const config = {
        region: await withCancel(
          text(
            { 
              message: 'S3 Region',
              defaultValue: 'auto',
              placeholder: 'auto',
            }
          ),
        ),
        bucket: await withCancel(
          text(
            { 
              message: 'S3 Bucket ID',
              validate: required,
            }
          ),
        ),
        forcePathStyle: await withCancel(
          confirm(
            { 
              message: 'S3: Force Path Style ?',
              active: 'Yes',
              inactive: 'No',
              initialValue: true,
            }
          ),
        ),
        accessKeyId: await withCancel(
          text(
            { 
              message: 'S3 Access Key ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        secretAccessKey: await withCancel(
          text(
            { 
              message: 'S3 Secret Access Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        )
      }

      return config;
    }

    case 's3_compatible': {
      /** @type {import('@storecraft/storage-s3-compatible').Config} */
      const config = {
        endpoint: await withCancel(
          text(
            { 
              message: 'S3 Compatible Endpoint',
              validate: required,
            }
          ),
        ),
        region: await withCancel(
          text(
            { 
              message: 'S3 Compatible Region',
              defaultValue: 'auto',
              placeholder: 'auto',
            }
          ),
        ),
        bucket: await withCancel(
          text(
            { 
              message: 'S3 Compatible Bucket ID',
              validate: required,
            }
          ),
        ),
        forcePathStyle: await withCancel(
          confirm(
            { 
              message: 'S3 Copatible > Force Path Style ?',
              active: 'Yes',
              inactive: 'No',
              initialValue: true,
            }
          ),
        ),
        accessKeyId: await withCancel(
          text(
            { 
              message: 'S3 Copatible Access Key ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        secretAccessKey: await withCancel(
          text(
            { 
              message: 'S3 Copatible Secret Access Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        )
      }

      return config;
    }

    case 'google_storage': {
      /** @type {import('@storecraft/storage-google').Config} */
      const config = {
        bucket: await withCancel(
          text(
            { 
              message: 'Google Storage Bucket ID',
              validate: required,
            }
          ),
        ),
        client_email: await withCancel(
          text(
            { 
              message: 'Google Storage Client Email',
              validate: required,
            }
          ),
        ),
        private_key_id: await withCancel(
          text(
            { 
              message: 'Google Storage Private Key ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        private_key: await withCancel(
          text(
            { 
              message: 'Google Storage Private Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        )
      }

      return config;
    }
      
  }

}