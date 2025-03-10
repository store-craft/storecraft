import { type AuthUserType, type OrderData } from "./types.api.js"


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