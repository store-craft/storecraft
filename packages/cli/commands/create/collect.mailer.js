import { select, input } from "@inquirer/prompts";

/** @satisfies {import("../utils.js").Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'SendGrid',
    value: 'sendgrid'
  },
  {
    name: 'Resend',
    value: 'resend'
  },
  {
    name: 'MailChimp',
    value: 'mailchimp'
  },
  {
    name: 'MailGun',
    value: 'mailgun'
  },
])


export const collect_mailer = async () => {

  const id = await select(
    {
      message: '📧 Select Email Provider',
      choices: choices,
      loop: true,
    }
  );

  return {
    type: 'mailer',
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
    case 'mailchimp': {
      /** @type {import('@storecraft/mailer-providers-http/mailchimp').Config} */
      const config = {
        apikey: await input(
          { 
            message: 'API Key',
            required: true,
          }
        )
      }

      return config;
    }

    case 'mailgun': {
      /** @type {import('@storecraft/mailer-providers-http/mailgun').Config} */
      const config = {
        apikey: await input(
          { 
            message: 'API Key',
            required: true,
          }
        ),
        domain_name: await input(
          { 
            message: 'Domain Name',
            required: true,
          }
        )
      }
      
      return config;
    }

    case 'resend': {
      /** @type {import('@storecraft/mailer-providers-http/resend').Config} */
      const config = {
        apikey: await input(
          { 
            message: 'API Key',
            required: true,
          }
        ),
      }
      
      return config;
    }

    case 'sendgrid': {
      /** @type {import('@storecraft/mailer-providers-http/sendgrid').Config} */
      const config = {
        apikey: await input(
          { 
            message: 'API Key',
            required: true,
          }
        ),
      }
      
      return config;
    }
      
  }

}