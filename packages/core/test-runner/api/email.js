/**
 * @import { BaseType } from '../../api/types.api.js'
 * @import { events, PubSubEvent } from '../../pubsub/types.public.js'
 * @import { SendMailParams, SendMailWithTemplateParams } from '../../mailer/types.mailer.js'
 * 
 */

import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from './api.utils.crud.js';
import esMain from './utils.esmain.js';
import { App } from '../../index.js';
import { assert_partial, assert_partial_v2 } from './utils.js';
import { compileTemplate } from '../../api/con.email.logic.js';
import { DummyMailer } from '../../mailer/dummy-mailer.js';


/**
 * 
 * @param {App} app 
 */
export const create = app => {

  const s = suite(
    file_name(import.meta.url), 
    { }
  );

  s.before(
    async () => { 
      assert.ok(app.ready);

      if(!Boolean(app.mailer)) {
        app.withMailer(
          new DummyMailer()
        );
      }
    }
  );

  s('send email', async (ctx) => {
    
    /** @type {Partial<events>} */
    const events_dispatched = {};
    const unsubs = [];

    // catch all events
    const unsub =  app.pubsub.on(
      '*',
      async (v) => {
        events_dispatched[v.event] = v.payload;
      }
    );

    assert.ok(
      app.mailer,
      `mailer was not set`
    );

    /** @type {SendMailParams} */
    let mail_object = {
      from: { address: app.config.general_store_support_email },
      to: [{address: 'support@storecraft.app' }],
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<h1>This is a test email</h1>',
    }

    const response = await app.api.email.sendMail(
      mail_object
    );

    assert.ok(
      response.success,
      `
      email was not successfully sent, here is the response: 
      ${JSON.stringify(response, null, 2)}
      `
    );

    { // test events
      assert.ok(
        'email/before-send' in events_dispatched,
        '`email/before-send` event was not dispatched'
      );

      assert_partial_v2(
        events_dispatched['email/before-send'].mail_object,
        mail_object,
        'email/before-send event payload is not the same as the mail object'
      );

      assert.ok(
        'email/after-send' in events_dispatched,
        '`email/after-send` event was not dispatched'
      );

      assert_partial_v2(
        events_dispatched['email/after-send'].mail_object,
        mail_object,
        'email/after-send event `payload.mail_object` is not the same as the mail object'
      );

      // unsub
      unsub();
    }

  });


  s('send email template', async (ctx) => {
    
    /** @type {Partial<events>} */
    const events_dispatched = {};

    // catch all events
    const unsub =  app.pubsub.on(
      '*',
      async (v) => {
        events_dispatched[v.event] = v.payload;
      }
    );

    assert.ok(
      app.mailer,
      `mailer was not set`
    );

    /** @type {SendMailWithTemplateParams<'welcome-customer'>} */
    const params = {
      emails: ['support@storecraft.app'],
      template_handle: 'welcome-customer',
      subject: 'Test Welcome Customer Email',
      data: {
        customer: {
          email: 'customer_name@example.com',
          firstname: 'Customer Firstname',
          lastname: 'Customer Lastname',
        },
        info: {
          general_confirm_email_base_url: 'https://storecraft.app',
          general_store_name: 'Storecraft',
          general_store_support_email: 'support@storecraft.app',
          general_forgot_password_confirm_base_url: 'https://storecraft.app',
          general_store_website: 'https://storecraft.app',
        },
        token: 'confirm-email-token'
      }
    }

    const response = await app.api.email.sendMailWithTemplate(
      params
    );

    assert.ok(
      response.success,
      `
      email was not successfully sent, here is the response: 
      ${JSON.stringify(response, null, 2)}
      `
    );

    assert.ok(
      events_dispatched['email/before-send'].mail_object.to.at(0).address===params.emails.at(0),
      'email/before-send event `payload.mail_object.to` is not the same as the emails'
    );

    { // test events
      assert.ok(
        'email/before-send' in events_dispatched,
        '`email/before-send` event was not dispatched'
      );

      assert.ok(
        'email/after-send' in events_dispatched,
        '`email/after-send` event was not dispatched'
      );

      // assert against real template
      {
        const template = await app.api.templates.get(params.template_handle);
        const { text, html } = compileTemplate(template, params.data);
        assert.ok(
          text && text===events_dispatched['email/before-send'].mail_object.text,
          'email/before-send event `payload.mail_object.text` \
          is not the same as the compiled text'
        );
        assert.ok(
          html && html===events_dispatched['email/before-send'].mail_object.html,
          'email/before-send event `payload.mail_object.html` is not the \
          same as the compiled html'
        );
      }

      // unsub
      unsub();
    }

  });

  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('./play.js');
    const app = await create_app();
    const s = create(app);
    s.after(async () => { await app.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();
