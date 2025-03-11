/**
 * @import { Config } from './types.public.js'
 * @import { mailer } from '@storecraft/core/mailer'
 * @import { ENV } from '@storecraft/core';
 * @import { Resend_sendmail, Resend_sendmail_attachment } from './types.private.js'
*/

import { address_to_friendly_name, convert_to_base64 } from "./adapter.utils.js";

/**
 * @description mailer with Resend rest api
 * 
 * @implements {mailer<Config>}
 */
export class Resend {
  
  /** @satisfies {ENV<Config>} */
  static EnvConfig = /** @type{const} */ ({
    apikey: 'RESEND_API_KEY'
  });

  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config={}) {
    this.#_config = config;
  }

  get config() { return this.#_config; }


  /** @type {mailer<Config>["onInit"]} */
  onInit = (app) => {
    this.config.apikey ??= app.platform.env[Resend.EnvConfig.apikey];
  };

  /**
   * 
   * @type {mailer["email"]}
   */
  async email(o) {

    /** @type {Resend_sendmail} */
    const body = {
      from: address_to_friendly_name(o.from),
      to: o.to.map(t => t.address),
      subject: o.subject,
      html: o.html,
      text: o.text,
      attachments: o.attachments && await Promise.all(
        o.attachments.map(
          /**
           * @returns {Promise<Resend_sendmail_attachment>}
           */
          async a => (
            {
              filename: a.filename,
              content: await convert_to_base64(a.content)
            }
          )
        )
      ),
    }

    let r;
    try {
      r = await fetch(
        'https://api.resend.com/emails',
        {
          body: JSON.stringify(body),
          headers: {
            'Authorization': `Bearer ${this.config.apikey}`,
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

