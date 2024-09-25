import { convert_to_base64 } from "./adapter.utils.js";

/**
 * @typedef {import("./types.public.d.ts").Config} Config
 * @typedef {import('@storecraft/core/v-mailer').mailer<Config>} mailer
 * @implements {mailer}
 * 
 * @description mailer with sendgrid http api
 */
export class SendGrid {
  
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

    /** @type {import("./types.private.js").SendgridV3_sendmail} */
    const body = {
      content: [
          { 
            type: 'text/html', value: o.html 
          }, 
          { 
            type: 'text/plain', value: o.text 
          }
        ].filter(c => Boolean(c.value)),
      from: { email: o.from.address, name: o.from.name ?? ''},
      subject: o.subject,
      attachments: o.attachments && await Promise.all(
        o.attachments.map(
          async a => (
            {
              content_id: a.content_id,
              disposition: a.disposition,
              filename: a.filename,
              type: a.content_type,
              content: await convert_to_base64(a.content)
            }
          )
        )
      ),
      personalizations: o.to.map(
        t => (
          {
            to: {
              email: t.address,
              name: t.name ?? ''
            }
          }
        )
      )
    }

    let r;
    try {
      r = await fetch(
        'https://api.sendgrid.com/v3/mail/send',
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

