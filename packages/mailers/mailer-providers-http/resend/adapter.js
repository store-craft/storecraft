import { address_to_friendly_name, convert_to_base64 } from "./adapter.utils.js";

/**
 * @typedef {import("./types.public.d.ts").Config} Config
 * @typedef {import('@storecraft/core/v-mailer').mailer<Config>} mailer
 * @implements {mailer}
 * 
 * mailer with Resend rest api
 */
export class MailerResend {
  
  /** @type {Config} */ #_config;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = config;
  }

  get config() { return this.#_config; }

  /**
   * 
   * @type {mailer["email"]}
   */
  async email(o) {

    /** @type {import("./types.private.js").Resend_sendmail} */
    const body = {
      from: address_to_friendly_name(o.from),
      to: o.to.map(t => t.address),
      subject: o.subject,
      html: o.html,
      text: o.text,
      attachments: o.attachments && await Promise.all(
        o.attachments.map(
          /**
           * @returns {Promise<import("./types.private.js").Resend_sendmail_attachment>}
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

