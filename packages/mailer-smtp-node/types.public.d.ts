import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export { MailerSmtpNode } from './index.js';

/**
 * @description nodemailer config
 */
export type Config = SMTPTransport.Options;

