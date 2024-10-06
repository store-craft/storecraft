export type Attachment = {
  filename?: string,
  content: string | ArrayBuffer | ReadableStream,
  content_type?: string,
  content_id?: string,
  disposition?: 'attachment' | 'inline' | undefined
}

export type MailAddress = {
  /** 
   * @description name of addressee 
   */
  name?: string;

  /** 
   * @description the email address 
   */
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
  /** 
   * @description success ? 
   */
  success?: boolean;

  /** 
   * @description The native response of the driver 
   */
  native_response?: T;
}

/**
 * @description mailer interface.
 * 
 */
export interface mailer<Config extends any, T=any> {

  /** 
   * @description config of the mailer 
   */
  get config(): Config;

  /**
   * @description Email something
   * 
   * @param o mail object
   */
  email: (o: MailObject) => Promise<MailResponse<T>>
}