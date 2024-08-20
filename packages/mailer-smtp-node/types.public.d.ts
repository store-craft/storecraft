import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export { MailerSmtpNode } from './index.js';

/**
 * nodemailer config
 */
export type Config = SMTPTransport.Options;

