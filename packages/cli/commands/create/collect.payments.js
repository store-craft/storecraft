import { select, input } from "@inquirer/prompts";

/** @satisfies {import("../utils.js").Choice[]} */
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

  const id = await select(
    {
      message: '💳 Select Payment Provider',
      choices: choices,
      loop: true,
    }
  );

  return {
    type: 'payments',
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
    case 'paypal': {
      /** @type {import('@storecraft/payments-paypal').Config} */
      const config = {
        default_currency_code: await input(
          { 
            message: 'Currency Code',
            required: true,
            default: 'USD'
          }
        ),
        // @ts-ignore
        env: await select(
          { 
            message: 'Environment',
            choices: [
              { name: 'prod',value: 'prod' },
              { name: 'test',value: 'test' },
            ],
            default: 'prod'
          }
        ),
        // @ts-ignore
        intent_on_checkout: await select(
          { 
            message: 'Intent on checkout Creation',
            choices: [
              { name: 'AUTHORIZE',value: 'AUTHORIZE' },
              { name: 'CAPTURE',value: 'CAPTURE' },
            ],
            default: 'AUTHORIZE'
          }
        ),
        client_id: await input(
          { 
            message: 'Client ID',
            required: true,
          }
        ),
        secret: await input(
          { 
            message: 'Secret',
            required: true,
          }
        )
      }

      return config;
    }

    case 'stripe': {
      /** @type {import('@storecraft/payments-stripe').Config} */
      const config = {
        stripe_intent_create_params: {
          currency: await input(
            { 
              message: 'Currency Code',
              required: true,
              default: 'USD'
            }
          ),
        },
        publishable_key: await input(
          { 
            message: 'Publishable Key',
            required: true,
          }
        ),
        secret_key: await input(
          { 
            message: 'Secret Key',
            required: true,
          }
        ),
        stripe_config: {
        }
      }
      return config;
    }

  }

}