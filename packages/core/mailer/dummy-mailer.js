/**
 * @import { mailer, MailObject, MailResponse } from './types.mailer.js'
 */


/**
 * @description Dummy Mailer for testing purposes
 * @implements {mailer}
 */
export class DummyMailer {

  /** @type {mailer["email"]} */
  email = async (o) => {
    return {
      success: true,
      native_response: {
        sent_at: new Date().toISOString(),
        message: 'email sent successfully',
      }
    }
  };
}
