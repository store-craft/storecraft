import { base64 } from "@storecraft/core/v-crypto";
import { address_to_friendly_name, convert_attachment_to_blob } from "./adapter.utils.js";

/**
 * @typedef {import("./types.public.js").Config} Config
 * @typedef {import('@storecraft/core/v-mailer').mailer<Config>} mailer
 * @implements {mailer}
 * 
 * mailer with mailgun http api
 */
export class MailerMailgun {
  
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

    const form = new FormData();
    form.append('from', address_to_friendly_name(o.from));

    o.to.forEach(
      t => {
        form.append('to', address_to_friendly_name(t));
      }
    );
    form.append('subject', o.subject);
    form.append('text', o.text);
    form.append('html', o.html);

    if(Array.isArray(o.attachments)) {
      o.attachments.forEach(
        async a => {
          form.append(
            'attachment', 
            await convert_attachment_to_blob(a.content), 
            a.filename ?? ''
          );
        }
      )
    }

    const auth = base64.encode(`api:${this.config.apikey}`, false);

    let r;
    try {
      r = await fetch(
        `https://api.mailgun.net/v3/${this.config.domain_name}/messages`,
        {
          body: form,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Basic ${auth}`
          },
          method: 'POST',
        }
      );
    } catch (e) {
      console.log(e);
    }
    
    return {
      success: r.ok,
      native_response: await r.text()
    }
  }

}

