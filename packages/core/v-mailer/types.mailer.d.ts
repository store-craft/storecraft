export type Attachment = {
  filename?: string,
  content: string | ArrayBuffer | ReadableStream,
  content_type?: string,
  content_id?: string,
  disposition?: 'attachment' | 'inline' | undefined
}

export type MailAddress = {
  /** name of addressee */
  name?: string;
  /** the email address */
  address: string;
}

export type MailObject = {
  from: MailAddress, 
  to: MailAddress[], 
  subject: string, 
  html: string, 
  text: string,
  attachments?: Attachment[]
}

export type MailResponse<T=any> = {
  /** success ? */
  success?: boolean;
  /** The native response of the driver */
  native_response?: T;
}

/**
 * mailer interface.
 * 
 */
export declare interface mailer<Config extends any, T=any> {

  /** config of the mailer */
  get config(): Config;

  /**
   * Email something
   * @param o mail object
   */
  email: (o: MailObject) => Promise<MailResponse<T>>
}