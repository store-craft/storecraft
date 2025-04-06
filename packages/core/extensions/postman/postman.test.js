/**
 * @import { OrderData, OrderDataUpsert } from '../../api/types.api.js'
 * @import { Test } from 'uvu';
 * @import { events } from '../../pubsub/types.public.js';
 */
import { create_app } from '../../create-app.test.js';
import { test, suite } from 'uvu';
import * as assert from 'uvu/assert';
import { file_name } from '../../test-runner/api/api.utils.crud.js';
import { enums } from '../../api/index.js';
import { App } from '../../index.js';
import { compileTemplate, sendMailWithTemplate } from '../../api/con.email.logic.js';

/** @type {OrderDataUpsert} */
const order_upsert_base = {
  contact: {
    email: 'tester-customer@example.com',
  },
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
    const id = await app.api.orders.upsert(
      order_upsert_base
    );

    /** @type {Partial<events>} */
    const events = {}
    app.pubsub.on(
      '*',
      async (event) => {
        events[event.event] = event.payload;
      }
    );

    await app.pubsub.dispatch(
      'orders/checkout/complete',
      {
        current: {
          ...order_upsert_base,
          id,
          status: {
            ...order_upsert_base.status,
            checkout: enums.CheckoutStatusEnum.complete
          }
        },
        previous: undefined
      }
    );

    console.log({events});

    const email_sent_from_extension = events['email/after-send'];

    assert.ok(
      email_sent_from_extension,
      `email was not sent`
    );
    assert.ok(
      events['email/after-send'].mail_object.to[0].address===order_upsert_base.contact.email,
      `email was not sent with the correct template`
    );

    // now let's send an email directly and catch the event and then compare

    // await sendMailWithTemplate(app)(
    //   {
    //     emails: [ order_upsert_base.contact.email ],
    //     template_handle: 'checkout-complete',
    //     subject: 'Your Order',
    //     data: {
    //       order: {
    //         ...order_upsert_base,
    //         id,
    //         status: {
    //           ...order_upsert_base.status,
    //           checkout: enums.CheckoutStatusEnum.complete
    //         }
    //       },
    //       info: {}
    //     }
    //   }
    // )

    console.log('upserted order', id);
  });

  return s;
}

create_test(
  await create_app(false)
)
.run();