/**
 * @import { extension } from '../types.public.js';
 * @import { AuthUserType, OrderData } from '../../api/types.api.js';
 */

import { App } from '../../index.js';
import { CONFIRM_EMAIL_TOKEN } from '@storecraft/core/api/con.auth.logic.js';
import { sendMailWithTemplate } from '../../api/con.email.logic.js';


/**
 * @description This extension will respond to various events to send customer emails:
 * - `orders/checkout/complete` via `checkout-complete` template, uses {@link OrderData}
 * - `orders/fulfillment/shipped` via `order-shipped` template, uses {@link OrderData}
 * - `orders/fulfillment/cancelled` via `order-cancelled` template, uses {@link OrderData}
 * - `auth/signup` via `welcome-customer` template, uses {@link AuthUserType}
 * - `auth/change-password` via `general-message` template, uses {@link AuthUserType}  
 * - `auth/forgot-password-token-generated` via `forgot-password` template, uses `{email: string, token: string}`
 * - `auth/confirm-email-token-generated` via `confirm-email` template (currently not present), uses `{email: string, token: string}`
 * 
 * **NOTE:** You are required to install `handlebars` (`npm i handlebars`)
 * 
 * @implements {extension}
 */
export class PostmanExtension {

  /**
   * @type {extension["info"]}
   */
  get info() {
    return {
      name: 'Postman Extension',
      description: 'This extension sends emails on events',
    }
  }

  /**
   * @type {extension["onInit"]}
   */ 
  onInit(app) {

    // checkout events notifications

    app.pubsub.on(
      'orders/checkout/complete',
      async (event) => {

        // console.log(event.payload.current)
        if(!event.payload.current?.contact?.email)
          return;

        await sendMailWithTemplate(
          event.app,
          [ event.payload.current.contact.email ],
          'checkout-complete',
          'Your Order',
          {
            order: event.payload.current,
            info: get_info(app),
          }
        );
      }
    );
    
    app.pubsub.on(
      'orders/fulfillment/shipped',
      async (event) => {

        if(!event.payload.current?.contact?.email)
          return;

        await sendMailWithTemplate(
          event.app,
          [ event.payload.current.contact.email ],
          'order-shipped',
          'Your Order Shipped',
          {
            order: event.payload.current,
            info: get_info(app),
          }
        );
      }
    );
    
    app.pubsub.on(
      'orders/fulfillment/cancelled',
      async (event) => {

        if(!event.payload.current?.contact?.email)
          return;

        await sendMailWithTemplate(
          event.app,
          [ event.payload.current.contact.email ],
          'order-cancelled',
          'Your Order Cancelled',
          {
            order: event.payload.current,
            info: get_info(app),
          }
        );
      }
    );
        
    // auth events

    app.pubsub.on(
      'auth/signup',
      async (event) => {
        await sendMailWithTemplate(
          event.app,
          [ event.payload.email ],
          'welcome-customer',
          'Welcome',
          {
            customer: event.payload,
            info: get_info(app),
            token: event.payload.attributes?.find(it => it.key===CONFIRM_EMAIL_TOKEN)?.value
          }
        );
      }
    );

    app.pubsub.on(
      'auth/change-password',
      async (event) => {
        await sendMailWithTemplate(
          event.app,
          [ event.payload.email ],
          'general-message',
          'Your Password was changed',
          {
            info: get_info(app),
            message: 'Your password has been changed. If it wasn\'t you, please reply to this email',
            firstname: event.payload.firstname ?? ''
          }
        );
      }
    );

    app.pubsub.on(
      'auth/confirm-email-token-generated',
      async (event) => {
        await sendMailWithTemplate(
          event.app,
          [ event.payload.auth_user.email ],
          'confirm-email',
          'Confirm Email',
          {
            info: get_info(app),
            message: {
              token: event.payload.token,
              firstname: event.payload.auth_user.firstname
            }
          }
        );
      }
    );

    app.pubsub.on(
      'auth/forgot-password-token-generated',
      async (event) => {
        await sendMailWithTemplate(
          event.app,
          [ event.payload.auth_user.email ],
          'forgot-password',
          'Confirm Forgot Password Request',
          {
            info: get_info(app),
            token: event.payload.token
          }
        );
      }
    );

  }

}


/**
 * 
 * @param {App} app 
 */
const get_info = app => {
  return {
    general_store_website: app.config.general_store_website,
    general_store_name: app.config.general_store_name,
    general_store_support_email: app.config.general_store_support_email,
    general_forgot_password_confirm_base_url: app.config.general_forgot_password_confirm_base_url,
    general_confirm_email_base_url: app.config.general_confirm_email_base_url
  }
}

