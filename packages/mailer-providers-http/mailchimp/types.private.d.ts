
export type Mailchimp_sendmail_message_to = {
  /** the email address of the recipient */
  email: string;
  /** the optional display name to use for the recipient */
  name?: string;
  /** the header type to use for the recipient, defaults to "to" if not provided Possible values: "to", "cc", or "bcc". */
  type?: 'to' | 'cc' | 'bcc';
}

export type Mailchimp_sendmail_message_attachment = {
  /** the MIME type of the attachment */
  type?: string;
  /** the file name of the attachment */
  name: string;
  /** the content of the attachment as a base64-encoded string */
  content: string;
}

export type Mailchimp_sendmail_message = {
  /** the full HTML content to be sent */
  html?: string;
  /** optional full text content to be sent */
  text?: string;
  /** the message subject */
  subject: string;
  /** the sender email address */
  from_email: string;
  /** optional from name to be used */
  from_name?: string;
  /** an array of recipient information. */
  to: Mailchimp_sendmail_message_to[];
  /** optional extra headers to add to the message (most headers are allowed) */
  headers?: Record<string, string>;
  /** an array of supported attachments to add to the message */
  attachments?: Mailchimp_sendmail_message_attachment[];
}

export type Mailchimp_sendmail = {
  /** a valid api key */
  key: string;
  /** enable a background sending mode that is optimized for bulk sending. In async mode, messages/send will immediately return a status of "queued" for every recipient. To handle rejections when sending in async mode, set up a webhook for the 'reject' event. Defaults to false for messages with no more than 10 recipients; messages with more than 10 recipients are always sent asynchronously, regardless of the value of async. */
  async?: boolean;
  /** the name of the dedicated ip pool that should be used to send the message. If you do not have any dedicated IPs, this parameter has no effect. If you specify a pool that does not exist, your default pool will be used instead. */
  ip_pool?: string;
  /** when this message should be sent as a UTC timestamp in YYYY-MM-DD HH:MM:SS format. If you specify a time in the past, the message will be sent immediately; for future dates, you're limited to one year from the date of scheduling. */
  send_at?: string;
  /** the information on the message to send */
  message: Mailchimp_sendmail_message;
}