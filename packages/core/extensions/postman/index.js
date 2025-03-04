/**
 * @import { extension } from '../types.public.js';
 * @import { AuthUserType, OrderData, TemplateType } from '../../api/types.api.js';
 */

import { App } from '../../index.js';
import { CONFIRM_EMAIL_TOKEN } from '@storecraft/core/api/con.auth.logic.js';
import Handlebars from 'handlebars';


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

        console.log(event.payload.current)
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
          [ event.payload.email ],
          'confirm-email',
          'Confirm Email',
          {
            info: get_info(app),
            token: event.payload.token
          }
        );
      }
    );

    app.pubsub.on(
      'auth/forgot-password-token-generated',
      async (event) => {
        await sendMailWithTemplate(
          event.app,
          [ event.payload.email ],
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

/**
 * @description compile a template into `html` and `text` if possible
 * @param {TemplateType} template 
 * @param {object} data 
 */
export const compileTemplate = (template, data) => {
  let html, text;
  if(template.template_html) {
    const handlebarsTemplateHTML = Handlebars.compile(template.template_html);
    html = handlebarsTemplateHTML(data);
  }

  if(template.template_text) {
    const handlebarsTemplateTEXT = Handlebars.compile(template.template_text);
    text = handlebarsTemplateTEXT(data);
  }

  return {
    text, html
  }
}

/**
 * @description Send Email with `template`
 * 
 * @param {App} app 
 * @param {string[]} emails 
 * @param {string} template_handle the template `handle` or `id` in the database
 * @param {string} subject 
 * @param {object} data 
 */
export const sendMailWithTemplate = async (app, emails, template_handle, subject, data) => {
  if(!app.mailer)
    return;

  const template = await app.api.templates.get(template_handle);

  if(!template) {
    throw new Error(
      `Template ${template_handle} not found !!`
    )
  }

  const { html, text } = compileTemplate(
    template, 
    data
  );

  const r = await app.mailer.email(
    {
      html,
      text,
      from: {
        address: app.config.general_store_support_email ?? 'support@storecraft.app',
        name: 'Support'
      },
      to: emails.map(e => ({address: e})),
      subject
    }
  );

  if(!r?.success) {
    console.log(r);
  }

}
