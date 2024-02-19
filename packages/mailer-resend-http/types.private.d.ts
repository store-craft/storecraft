
export type Resend_sendmail_tag = {
  /** The name of the email tag. It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-). It can contain no more than 256 characters. */
  name: string;
  /** The value of the email tag. It can only contain ASCII letters (a–z, A–Z), numbers (0–9), underscores (_), or dashes (-). It can contain no more than 256 characters. */
  value?: string;
}

export type Resend_sendmail_attachment = {
  /** Content of an attached file, base 64 encoded. */
  content?: string;
  /** Name of attached file. */
  filename?: string;
  /** Path where the attachment file is hosted */
  path?: string;
}

export type Resend_sendmail = {
  /** Sender email address. To include a friendly name, use the format "Your Name <sender@domain.com>". */
  from: string,
  /** Recipient email address. For multiple addresses, send as an array of strings. Max 50. */
  to: string | string[]
  /** Email subject. */
  subject: string,
  /** Bcc recipient email address. For multiple addresses, send as an array of strings. */
  bcc?: string | string[],
  /** Cc recipient email address. For multiple addresses, send as an array of strings. */
  cc?: string | string[],
  /** Reply-to email address. For multiple addresses, send as an array of strings. */
  reply_to?: string | string[],
  /** The HTML version of the message. */
  html?: string;
  /** The plain text version of the message. */
  text?: string;
  /** Custom headers to add to the email. */
  headers?: Record<string, string>,
  /** Email tags */
  tags?: Resend_sendmail_tag[],
  /** Filename and content of attachments (max 40mb per email) */
  attachments?: Resend_sendmail_attachment[];
}