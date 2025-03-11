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
    name: 'Stripe',
    value: 'stripe'
  },
  {
    name: 'PayPal',
    value: 'paypal'
  },
])


export const collect_payments = async () => {
  let configs = [];
  let more = true;

  while(more) {
    const id = await withCancel(
      select(
        {
          message: '💳 Select Payment Provider',
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
        type: 'payments',
        id: id,
        config: await collect_general_config(id)
      }
    )

    more = await withCancel(
      confirm(
        {
          message: 'Add another payment gateway or config ?',
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
    case 'paypal': {
      /** @type {import('@storecraft/payments-paypal').Config} */
      const config = {
        default_currency_code: await withCancel(
          text(
            { 
              message: 'Paypal Currency Code',
              defaultValue: 'USD',
              placeholder: 'USD',
            }
          ),
        ),
        // @ts-ignore
        env: await withCancel(
          select(
            { 
              message: 'Paypal Environment',
              options: [
                { label: 'prod',value: 'prod' },
                { label: 'test',value: 'test' },
              ],
              initialValue: 'prod'
            }
          ),
        ),
        // @ts-ignore
        intent_on_checkout: await withCancel(
          select(
            { 
              message: 'Paypal Intent on checkout Creation',
              options: [
                { label: 'AUTHORIZE',value: 'AUTHORIZE' },
                { label: 'CAPTURE',value: 'CAPTURE' },
              ],
              initialValue: 'AUTHORIZE'
            }
          ),
        ),
        client_id: await withCancel(
          text(
            { 
              message: 'Paypal Client ID',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        secret: await withCancel(
          text(
            { 
              message: 'Paypal Secret',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        )
      }

      return config;
    }

    case 'stripe': {
      /** @type {import('@storecraft/payments-stripe').Config} */
      const config = {
        stripe_intent_create_params: {
          currency: await withCancel(
            text(
              { 
                message: 'Stripe Currency Code',
                defaultValue: 'USD',
                placeholder: 'USD',
              }
            ),
          )
        },
        publishable_key: await withCancel(
          text(
            { 
              message: 'Stripe Publishable Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        secret_key: await withCancel(
          text(
            { 
              message: 'Stripe Secret Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        stripe_config: {
        }
      }
      return config;
    }

  }

}