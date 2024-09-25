/**
 * @import { extension } from '@storecraft/core/v-extensions';
 * @import { AuthUserType, OrderData, TemplateType } from '@storecraft/core/v-api';
 */

import { App } from '@storecraft/core';
import { enums } from '@storecraft/core/v-api';
import Handlebars from 'handlebars';


/**
 * @description This extension will respond to various events to send customer emails:
 * - `orders/checkout/complete`
 * - `orders/fulfillment/shipped`
 * - `orders/fulfillment/cancelled`
 * - `auth/signup`
 * - `auth/reset-password`
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

        if(!event.payload.current?.contact?.email)
          return;

        await sendMailWithTemplate(
          event.app,
          [ event.payload.current.contact.email ],
          'checkout-complete',
          'Your Order',
          {
            order: event.payload.current,
            info: {
              general_store_website: app.config.general_store_website,
              general_store_name: app.config.general_store_name,
              general_store_support_email: app.config.general_store_support_email,
            }
          }
      
        );

      }
    );
    

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
            info: {
              general_store_website: app.config.general_store_website,
              general_store_name: app.config.general_store_name,
              general_store_support_email: app.config.general_store_support_email,
            }
          }
      
        );

      }
    );

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

  const { html, text } = compileTemplate(
    template, 
    data
  );

  return app.mailer.email(
    {
      html,
      text,
      from: {
        address: app.config.general_store_support_email,
        name: 'Support'
      },
      to: emails.map(e => ({address: e})),
      subject
    }
  )
}
