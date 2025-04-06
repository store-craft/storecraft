import { App } from "../types.public.js";

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
  config?: Config;

  /**
   * @description Your chance to read `env` variable for the config
   * @param app `storecraft` app instance
   */
  onInit?: (app: App) => any | void;

  /**
   * @description Email something
   * 
   * @param o mail object
   */
  email: (o: MailObject) => Promise<MailResponse<T>>
}

import { type AuthUserType, type OrderData } from "./../api/types.api.js"


export type general_store_info = {
  general_store_website: string,
  general_store_name: string,
  general_store_support_email: string,
  general_forgot_password_confirm_base_url: string,
  general_confirm_email_base_url: string
}

/**
 * @description parameters for the official email templates of `storecraft`
 */
export type templates_input_types = {
  'checkout-complete': {
    info: general_store_info,
    order: Partial<OrderData>
  }

  'order-shipped': {
    info: general_store_info,
    order: Partial<OrderData>
  }

  'order-cancelled': {
    info: general_store_info,
    order: Partial<OrderData>
  }

  'welcome-customer': {
    customer: Partial<AuthUserType>,
    info: general_store_info,
    // confirm email token
    token: string
  }

  'general-message': {
    info: general_store_info,
    // message to appear in email body
    message?: string,
    // the name of the customer
    firstname?: string
  }

  'general-message-with-action': { // prefer to use this over `general-message`
    info: general_store_info,
    // message to appear in email body
    message?: {
      // body of message
      content?: string,
      // the name of the email recipient
      firstname?: string,
      // action button displayable title
      action_title?: string
      // action button url link
      action_url?: string,
    }
  }

  'forgot-password': {
    info: general_store_info,
    // forgot password token
    token: string
  }

  'confirm-email': {
    info: general_store_info,
    message: {
      // confirm-email token
      token: string,
      firstname?: string
      /** optional text body to override the default */
      content?: string
    }
  }

}

export type templates_keys = keyof templates_input_types;

/**
 * @description parameters for sending mail
 */
export type SendMailParams = MailObject;

/**
 * @description parameters for sending mail with a template
 */
export type SendMailWithTemplateParams<
  HANDLE extends templates_keys | string = templates_keys
> = {
  /**
   * @description the email addresses to send the email to
   */
  emails: string[],
  /** the template `handle` or `id` in the database */
  template_handle: HANDLE,
  /**
   * @description key-value data to be used in the template 
   */
  data: HANDLE extends templates_keys ? templates_input_types[HANDLE] : any
}
  