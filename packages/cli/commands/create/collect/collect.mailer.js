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
import { required, withCancel } from "./collect.utils.js";

/** @satisfies {Choice[]} */
export const choices = /** @type {const} */ ([
  {
    name: 'Resend',
    value: 'resend'
  },
  {
    name: 'SendGrid',
    value: 'sendgrid'
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

  const id = await withCancel(
    select(
      {
        message: '📧 Select Email Provider',
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
        apikey: await withCancel(
          text(
            { 
              message: 'Mailchimp API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          )
        )
      }

      return config;
    }

    case 'mailgun': {
      /** @type {import('@storecraft/mailer-providers-http/mailgun').Config} */
      const config = {
        apikey: await withCancel(
          text(
            { 
              message: 'Mailgun API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        ),
        domain_name: await withCancel(
          text(
            { 
              message: 'Domain Name',
              validate: required,
            }
          )
        )
      }
      
      return config;
    }

    case 'resend': {
      /** @type {import('@storecraft/mailer-providers-http/resend').Config} */
      const config = {
        apikey: await withCancel(
          text(
            { 
              message: 'Resend API Key',
              defaultValue: '*****',
              placeholder: '*****',
            }
          ),
        )
      }
      
      return config;
    }

    case 'sendgrid': {
      /** @type {import('@storecraft/mailer-providers-http/sendgrid').Config} */
      const config = {
        apikey: await withCancel(
          text(
            { 
              message: 'Sendgrid API Key',
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