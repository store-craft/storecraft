/**
 * @import { templates_input_types, templates_keys } from './con.email.types.js'
 * @import { TemplateType } from './types.api.js'
 * @import { MailObject } from '../mailer/types.mailer.js'
 */
import { App } from "../index.js";
import Handlebars from 'handlebars';

/**
 * @description compile a template into `html` and `text` if possible
 * 
 * @param {TemplateType} template 
 * @param {object} data 
 */
const compileTemplate = (template, data) => {
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
 * @description Send Email with `template` and typed parameters (great developer experience)
 * 
 * 
 * @template {templates_keys | string} [HANDLE=keyof templates_input_types]
 * @param {App} app 
 * @param {string[]} emails 
 * @param {HANDLE} template_handle the template `handle` or `id` in the database
 * @param {string} subject 
 * @param {HANDLE extends templates_keys ? templates_input_types[HANDLE] : any} data 
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

  return sendMail(
    app,
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
 * @description send email and dispatch events
 * @param {App} app 
 * @param {MailObject} mail 
 */
export const sendMail = async (app, mail) => {
  await app.pubsub.dispatch(
    'email/before-send',
    mail
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