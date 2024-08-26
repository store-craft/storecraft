import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import { attachment_convert } from "./index.utils.js";

/**
 * @typedef {nodemailer.Transporter<SMTPTransport.SentMessageInfo>} NodemailerClient
 * @typedef {import("./types.public.d.ts").Config} Config
 * @typedef {import('@storecraft/core/v-mailer').mailer<Config>} mailer
 * @implements {mailer}
 * 
 * mailer with nodemailer for node.js
 */
export class MailerSmtpNode {
  
  /** @type {Config} */ #_config;
  /** @type {NodemailerClient} */ #_client;

  /**
   * 
   * @param {Config} config 
   */
  constructor(config) {
    this.#_config = config;
    this.#_client = nodemailer.createTransport(
      config
    );
  }

  get config() { return this.#_config; }
  get client() { return this.#_client; }

  /**
   * 
   * @type {mailer["email"]}
   */
  async email(o) {
    let r;
    try {
      r = await this.client.sendMail(
        {
          from: { address: o.from.address, name: o.from.name ?? ''},
          to: o.to.map(
            t => (
              {
                address: t.address, 
                name: t.name ?? ''
              }
            )
          ),
          subject: o.subject,
          text: o.text,
          html: o.html, 
          attachments: o.attachments?.map(
            a => (
              {
                cid: a.content_id, 
                contentDisposition: a.disposition, 
                filename: a.filename,
                contentType: a.content_type, 
                content: attachment_convert(a.content)
              }
            )
          )
        }
      );
    } catch(e) {
      console.log(e);
    }

    return {
      success: Boolean(r),
      native_response: r
    }
  }

}

