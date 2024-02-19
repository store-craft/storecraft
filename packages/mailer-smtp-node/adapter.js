import nodemailer from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

/**
 * @typedef {nodemailer.Transporter<SMTPTransport.SentMessageInfo>} NodemailerClient
 * @typedef {import("./types.public.js").Config} Config
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
          from: o.from,
          to: o.to,
          subject: o.subject,
          text: o.text,
          html: o.html
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

