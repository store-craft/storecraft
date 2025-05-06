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
import { withCancel } from './collect.utils.js';

/** @satisfies {Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'node',
    value: 'node',
  },
  {
    name: 'bun',
    value: 'bun',
  },
  {
    name: 'deno',
    value: 'deno',
  },
  {
    name: 'cloudflare workers',
    value: 'cloudflare-workers',
  },
  {
    name: 'Google Functions',
    value: 'google-functions',
  },
  {
    name: 'AWS Lambda + Gateway (experimental)',
    value: 'aws-lambda',
  },
]);

export const collect_platform = async () => {

  const id = await withCancel(
    select(
      {
        message: '🌐 Select a platform to run the store',
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
    type: 'platform',
    id: id,
    config: {
    }
  };
}