/**
 * @import { TemplateType } from './types.api.js'
 * @import { 
 *  templates_input_types, templates_keys, SendMailParams, 
 *  SendMailWithTemplateParams 
 * } from '../mailer/types.mailer.js'
 */
import { App } from "../index.js";
import { Minibars } from '../mailer/minibars.js';
import { assert } from "./utils.func.js";

/**
 * @description compile a template into `html` and `text` if possible
 * @param {TemplateType} template 
 * @param {object} data 
 */
const compileTemplate = (template, data) => {
  let html, text;
  if(template.template_html) {
    const handlebarsTemplateHTML = Minibars.compile(template.template_html);
    html = handlebarsTemplateHTML(data);
  }

  if(template.template_text) {
    const handlebarsTemplateTEXT = Minibars.compile(template.template_text);
    text = handlebarsTemplateTEXT(data);
  }

  return {
    text, html
  }
}


/**
 * @param {App} app 
 */
export const sendMailWithTemplate = (app) => 
  /**
   * @description Send Email with `template` and typed parameters (great developer experience)
   * @template {templates_keys | string} [HANDLE=keyof templates_input_types]
   * @param {SendMailWithTemplateParams<HANDLE>} data 
   */
  async ({emails, template_handle, subject, data}) => {
    
    assert(
      app.mailer,
      'Mailer not found'
    );
    
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

    return sendMail(app)(
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
  }

/**
 * @param {App} app 
 */
export const sendMail = (app) => 
  /**
   * @description send email and dispatch events
   * @param {SendMailParams} mail 
   */
  async (mail) => {
    await app.pubsub.dispatch(
      'email/before-send',
      mail
    );

    assert(
      app.mailer,
      'Mailer not found'
    );

    const r = await app.mailer.email(mail);

    await app.pubsub.dispatch(
      'email/after-send',
      {
        mail_object: mail,
        mail_response: r
      }
    );


    if(!r?.success) {
      console.log(r);
    }
    return r;
  }


/**
 * 
 * @param {App} app
 */  
export const inter = app => {

  return {
    sendMail: sendMail(app),
    sendMailWithTemplate: sendMailWithTemplate(app),
  }
}