export type Attachment = {
  filename: string,
  content: string | ArrayBuffer | ReadableStream
}

export type MailObject = {
  from: string, 
  to: string[], 
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