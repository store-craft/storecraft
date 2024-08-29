
export type SendgridV3_sendmail_content = {
  /** The MIME type of the content you are including in your email (e.g., “text/plain” or “text/html”). */
  type: string,
  /** The actual content of the specified MIME type that you are including in your email. */
  value: string,
}

export type SendgridV3_sendmail_attachment = {
  /** The Base64 encoded content of the attachment. */
  content: string;
  /** The MIME type of the content you are attaching (e.g., “text/plain” or “text/html”). */
  type?: string;
  /** The attachment's filename.  */
  filename: string;
  /**
   * The attachment's content-disposition, specifying how you would like the attachment 
   * to be displayed. For example, “inline” results in the attached file are displayed 
   * automatically within the message while “attachment” results in the attached file 
   * require some action to be taken before it is displayed, such as opening or downloading the file.
   * default: attachment
   * Allowed Values: inline, attachment
   */
  disposition: 'inline' | 'attachment';
  /** The attachment's content ID. This is used when the disposition is set to “inline” and the attachment is an image, allowing the file to be displayed within the body of your email. */
  content_id: string;
}

export type SendgridV3_sendmail_address = {
  /** The 'From' email address used to deliver the message. This address should be a verified sender in your Twilio SendGrid account. format: email */
  email: string,
  /** A name or title associated with the sending email address. */
  name?: string
}

export type SendgridV3_sendmail_personalization = {
  from?: SendgridV3_sendmail_address,
  to: SendgridV3_sendmail_address,
  /** An array of recipients who will receive a copy of your email. Each object in this array must contain the recipient's email address. Each object in the array may optionally contain the recipient's name. maxItems: 1000 */
  cc?: SendgridV3_sendmail_address[],
  /** An array of recipients who will receive a copy of your email. Each object in this array must contain the recipient's email address. Each object in the array may optionally contain the recipient's name. maxItems: 1000 */
  bcc?: SendgridV3_sendmail_address[],
  /** The subject of your email. See character length requirements according to RFC 2822. */
  subject?: string

}

export type SendgridV3_sendmail = {
  from: SendgridV3_sendmail_address,
  /** The global or 'message level' subject of your email. This may be overridden by subject lines set in personalizations. minLength: 1 */
  subject: string,
  /** An array where you can specify the content of your email. You can include multiple MIME types of content, but you must specify at least one MIME type. To include more than one MIME type, add another object to the array containing the type and value parameters. */
  content: SendgridV3_sendmail_content[],
  /** An array of objects where you can specify any attachments you want to include. */
  attachments?: SendgridV3_sendmail_attachment[],
  /** An array of messages and their metadata. Each object within personalizations can be thought of as an envelope - it defines who should receive an individual message and how that message should be handled. See our Personalizations documentation for examples. */
  personalizations: SendgridV3_sendmail_personalization[]
}