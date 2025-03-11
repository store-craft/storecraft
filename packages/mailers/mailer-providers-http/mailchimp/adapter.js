/**
 * @import { Config } from './types.public.js'
 * @import { ENV } from '@storecraft/core';
 * @import { mailer } from '@storecraft/core/mailer'
 * @import { 
 *  Mailchimp_sendmail, Mailchimp_sendmail_message_attachment 
 * } from './types.private.js'
*/

import { convert_to_base64 } from "./adapter.utils.js";


/**
 * @description mailer with mail-chimp / mandrill http api
 * 
 * @implements {mailer<Config>}
 */
export class MailChimp {
  
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    apikey: 'MAILCHIMP_API_KEY'
  });

  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = config;
  }

  get config() { return this.#_config; }

  /** @type {mailer<Config>["onInit"]} */
  onInit = (app) => {
    this.config.apikey ??= app.platform.env[MailChimp.EnvConfig.apikey];
  };

  /**
   * 
   * @type {mailer["email"]}
   */
  async email(o) {

    /** @type {Mailchimp_sendmail} */
    const body = {
      key: this.config.apikey,
      message: {
        from_email: o.from.address,
        from_name: o.from.name,
        to: o.to.map(t => ({ email:t.address, name: t.name, type: 'to'})),
        subject: o.subject,
        html: o.html,
        text: o.text,
        attachments: o.attachments && await Promise.all(
          o.attachments.map(
            /**
             * @returns {Promise<Mailchimp_sendmail_message_attachment>}
             */
            async a => ({
              type: a.content_type, 
              name: a.filename, 
              content: await convert_to_base64(a.content)
            })
          )
        ),
      }
    }

    let r;
    try {
      r = await fetch(
        'https://mandrillapp.com/api/1.0/messages/send',
        {
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      );
    } catch (e) {
      console.log(e);
    }
    
    return {
      success: r.ok,
      native_response: await r.json()
    }
  }

}

