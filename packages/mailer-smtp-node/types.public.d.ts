import SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

export * from './index.js';

/**
 * nodemailer config
 */
export type Config = SMTPTransport.Options;

