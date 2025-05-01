/**
 * @import { Choice } from '../../utils.js';
 */
import {
  confirm,
  select,
  text, 
} from '@clack/prompts';
import { withCancel } from './collect.utils.js';

/** @satisfies {Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'Google',
    value: 'google'
  },
  {
    name: 'Facebook',
    value: 'facebook'
  },
  {
    name: 'Github',
    value: 'github'
  },
  {
    name: 'X (Twitter)',
    value: 'x'
  },
])

export const collect_auth_providers = async () => {
  let configs = [];
  let more = true;

  const start = await withCancel(
    confirm(
      {
        message: 'Add Social 👥 Login ? (google / facebook / github / x)',
        active: 'Yes',
        inactive: 'No',
        initialValue: true
      }
    )
  );

  if(!start) {
    return undefined;
  }

  while(more) {
    const id = await withCancel(
      select(
        {
          message: '🔑 Select Auth Provider',
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
    )

    configs.push(
      {
        type: 'auth-providers',
        id: id,
        config: await collect_general_config(id)
      }
    );

    more = await withCancel(
      confirm(
        {
          message: 'Would you like to add more ?',
          active: 'Yes',
          inactive: 'No',
          initialValue: false
        }
      )
    )
  }  

  return configs;
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
    case 'facebook': {
      /** @type {import('@storecraft/core/auth/providers/facebook').Config} */
      const config = {
        app_id: await withCancel(
          text(
            { 
              message: 'App ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        app_secret: await withCancel(
          text(
            { 
              message: 'App Secret',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
      }

      return config;
    }

    case 'github': {
      /** @type {import('@storecraft/core/auth/providers/github').Config} */
      const config = {
        client_id: await withCancel(
          text(
            { 
              message: 'Client ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        client_secret: await withCancel(
          text(
            { 
              message: 'Client Secret',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
      }
      return config;
    }

    case 'google': {
      /** @type {import('@storecraft/core/auth/providers/google').Config} */
      const config = {
        client_id: await withCancel(
          text(
            { 
              message: 'Client ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        client_secret: await withCancel(
          text(
            { 
              message: 'Client Secret',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
      }
      return config;
    }

    case 'x': {
      /** @type {import('@storecraft/core/auth/providers/x').Config} */
      const config = {
        consumer_api_key: await withCancel(
          text(
            { 
              message: 'Consumer API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
        consumer_api_secret: await withCancel(
          text(
            { 
              message: 'Consumer API Secret',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        ),
      }      
      return config;
    }
      
  }

}