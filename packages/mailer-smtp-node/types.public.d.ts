import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export { MailerSmtpNode } from './adapter.js';

/**
 * @description nodemailer config
 */
export type Config = SMTPTransport.Options;

