/**
 * @import { AuthUserType, OrderData } from '../../api/types.api.js'
 * @import { Test } from 'uvu';
 * @import { events } from '../../pubsub/types.public.js';
 * @import { InitializedStorecraftApp } from '../../types.public.js';
 */
import { test, suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../../test-runner/api/api.utils.file.js';
import { enums } from '../../api/index.js';
import { App } from '../../index.js';
import { sendMailWithTemplate } from '../../api/con.email.logic.js';
import { get_info } from './index.js';
import { ID } from '../../api/utils.func.js';
import { CONFIRM_EMAIL_TOKEN } from '../../api/con.auth.logic.js';
import esMain from '../../test-runner/api/utils.esmain.js';

/** @type {OrderData} */
const order_base = {
  contact: {
    email: 'tester-customer@example.com',
  },
  id: ID('order'),
  status: {
    checkout: enums.CheckoutStatusEnum.created,
    payment: enums.PaymentOptionsEnum.authorized,
    fulfillment: enums.FulfillOptionsEnum.draft
  },
  pricing: {
    quantity_discounted: 3, quantity_total: 5, subtotal: 100, 
    subtotal_discount: 30, subtotal_undiscounted: 70,
    total: 120
  },
  line_items: [
    { 
      id: 'pr-1-id', qty: 3, 
      data: { 
        title: 'Product 1'
      } 
    },
    { 
      id: 'pr-2-id', qty: 2,
      data: { 
        title: 'Product 2'
      } 
    },
  ],
  shipping_method: {
    handle: 'ship-a', title: 'ship a', price: 30, id: ''
  }
}

/**
 * @description Tests for the Postman extension, which sends emails on events.
 * The testing strategy is not end to end, but rather, dispatch events
 * in the system and the record, that mail events were dispatched because
 * the extension has sent emails.
 * @param {App} app 
 */
export const create_test = (app) => {
  const s = suite(file_name(import.meta.url));

  s('send mail on `orders/checkout/complete` event', async () => {
    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {OrderData} */
    const order = {
      ...order_base,
      status: {
        ...order_base.status,
        checkout: enums.CheckoutStatusEnum.complete
      }
    }

    await app.pubsub.dispatch(
      'orders/checkout/complete',
      {
        current: order,
        previous: undefined
      }
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await sendMailWithTemplate(app)(
      {
        emails: [ order_base.contact.email ],
        template_handle: 'checkout-complete',
        data: {
          order: order,
          info: get_info(app)
        }
      }
    );

    assert.ok(
      events['email/after-send'],
      `secondary validation email was not sent`
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'checkout-complete' template`
    );

  });

  s('send mail on `orders/fulfillment/shipped` event', async () => {

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {OrderData} */
    const order = {
      ...order_base,
      status: {
        ...order_base.status,
        fulfillment: enums.FulfillOptionsEnum.shipped
      }
    }

    await app.pubsub.dispatch(
      'orders/fulfillment/shipped',
      {
        current: order,
        previous: undefined
      }
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await sendMailWithTemplate(app)(
      {
        emails: [ order_base.contact.email ],
        template_handle: 'order-shipped',
        data: {
          order: order,
          info: get_info(app)
        }
      }
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'order-shipped' template`
    );

  });

  s('send mail on `orders/fulfillment/cancelled` event', async () => {

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {OrderData} */
    const order = {
      ...order_base,
      status: {
        ...order_base.status,
        fulfillment: enums.FulfillOptionsEnum.shipped
      }
    }

    await app.pubsub.dispatch(
      'orders/fulfillment/cancelled',
      {
        current: order,
        previous: undefined
      }
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await sendMailWithTemplate(app)(
      {
        emails: [ order_base.contact.email ],
        template_handle: 'order-cancelled',
        data: {
          order: order,
          info: get_info(app)
        }
      }
    );

    assert.ok(
      events['email/after-send'],
      `secondary validation email was not sent`
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'order-cancelled' template`
    );

  });


  s('send mail on `auth/signup` event', async () => {

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {Partial<AuthUserType>} */
    const user = {
      id: ID('au'),
      active: true,
      email: 'tester@example.com',
      firstname: 'John',
      lastname: 'Doe',
      confirmed_mail: false,
      attributes: [
        {
          key: CONFIRM_EMAIL_TOKEN,
          value: 'confirm_email_token'
        },
      ]
    }

    await app.pubsub.dispatch(
      'auth/signup',
      user
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await sendMailWithTemplate(app)(
      {
        emails: [ user.email ],
        template_handle: 'welcome-customer',
        data: {
          customer: user,
          token: user.attributes.find(
            it => it.key===CONFIRM_EMAIL_TOKEN
          )?.value,
          info: get_info(app)
        }
      }
    );

    assert.ok(
      events['email/after-send'],
      `secondary validation email was not sent`
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'welcome-customer' template`
    );

  });

  s('send mail on `auth/change-password` event', async () => {

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {Partial<AuthUserType>} */
    const user = {
      id: ID('au'),
      active: true,
      email: 'tester@example.com',
      firstname: 'John',
      lastname: 'Doe',
      confirmed_mail: false,
      attributes: [
        {
          key: CONFIRM_EMAIL_TOKEN,
          value: 'confirm_email_token'
        },
      ]
    }

    await app.pubsub.dispatch(
      'auth/change-password',
      user
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await app.api.email.sendMailWithTemplate(
      {
        emails: [ user.email ],
        template_handle: 'general-message',
        data: {
          info: get_info(app),
          message: 'Your password has been changed. If it wasn\'t you, please reply to this email',
          firstname: user.firstname ?? ''
        }
      }
    );

    assert.ok(
      events['email/after-send'],
      `secondary validation email was not sent`
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'auth/change-password' event`
    );

  });


  s('send mail on `auth/confirm-email-token-generated` event', async () => {

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {events["auth/confirm-email-token-generated"]} */
    const payload = {
      auth_user: {
        id: ID('au'),
        active: true,
        email: 'tester@example.com',
        firstname: 'John',
        lastname: 'Doe',
        confirmed_mail: false,
        attributes: [
          {
            key: CONFIRM_EMAIL_TOKEN,
            value: 'confirm_email_token'
          },
        ]
      },
      token: 'confirm_email_token'
    }

    await app.pubsub.dispatch(
      'auth/confirm-email-token-generated',
      payload
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await app.api.email.sendMailWithTemplate(
      {
        emails: [ payload.auth_user.email ],
        template_handle: 'confirm-email',
        data: {
          info: get_info(app),
          message: {
            token: payload.token,
            firstname: payload.auth_user.firstname,
            content: 'Please confirm your email address by clicking the link below'
          }
        }
      }
    );

    assert.ok(
      events['email/after-send'],
      `secondary validation email was not sent`
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'auth/confirm-email-token-generated' event`
    );

  });


  s('send mail on `auth/forgot-password-token-generated` event', async () => {

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    /** @type {events["auth/forgot-password-token-generated"]} */
    const payload = {
      auth_user: {
        id: ID('au'),
        active: true,
        email: 'tester@example.com',
        firstname: 'John',
        lastname: 'Doe',
        confirmed_mail: false,
      },
      token: 'forgot_password_token'
    }

    await app.pubsub.dispatch(
      'auth/forgot-password-token-generated',
      payload
    );

    const email_sent_from_extension = events['email/after-send'];
    
    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );

    // now let's send the exact email directly and catch the event and then compare
    events['email/after-send'] = undefined;
    await app.api.email.sendMailWithTemplate(
      {
        emails: [ payload.auth_user.email ],
        template_handle: 'forgot-password',
        data: {
          info: get_info(app),
          token: payload.token
        }
      }
    );

    assert.ok(
      events['email/after-send'],
      `secondary validation email was not sent`
    );

    assert.equal(
      events['email/after-send']?.mail_object,
      email_sent_from_extension.mail_object,
      `email was not sent with the correct 'auth/forgot-password-token-generated' event`
    );

  });

  return s;
}


(async function inner_test() {
  // helpful for direct inner tests
  if(!esMain(import.meta)) return;
  try {
    const { create_app } = await import('../../app.test.fixture.js');
    const app = await create_app(false);
    const s = create_test(app);
    s.after(async () => { await app.__show_me_everything.db.disconnect() });
    s.run();
  } catch (e) {
  }
})();