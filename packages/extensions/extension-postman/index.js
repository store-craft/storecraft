/**
 * @import { extension } from '@storecraft/core/v-extensions';
 * @import { AuthUserType, OrderData } from '@storecraft/core/v-api';
 */

import { enums } from '@storecraft/core/v-api';

/**
 * @implements {extension}
 */
export class PostmanExtension {

  /**
   * @type {extension["info"]}
   */
  get info() {
    return {
      name: 'Notification Extension',
      description: 'This extension listens to some events and publishes notifications',
    }
  }

  /**
   * @type {extension["onInit"]}
   */
  onInit(app) {

    // checkout events notifications

    app.pubsub.on(
      'orders/upsert',
      async (event) => {
        const order_after = event.payload.current;
        const order_before = event.payload.previous;

        // test if the checkout now has turned complete
        const has_checkout_completed_now = (
          order_after.status.checkout.id===enums.CheckoutStatusEnum.complete.id &&
          order_before?.status?.checkout?.id!==order_after.status.checkout.id
        );

        if(has_checkout_completed_now) {
          // send checkout mail
        }
      }
    );

    app.pubsub.on(
      'auth/signup',
      async (event) => {
      }
    );

  }

}


/**
 * 
 * @param {Partial<OrderData>} o 
 * @param {string} [title] 
 * @returns {NotificationTypeUpsert}
 */
const checkout_notification = (o, title='Checkout Update') => {

  return {
    message: `
💰 **${title}**\n 
* \`${o?.address?.firstname ?? 'unknown'}\` has checkout update. 
* 💳 Order total is \`${o?.pricing?.total ?? '-'}\`.
* 📧 Email is ${o?.contact?.email ?? 'no-email'}
`,
    author: 'backend-bot 🤖',
    actions: [
      {
        name: 'view',
        type: 'route',
        params: {
          collection: 'orders',
          document: o.id,
        }
      }
    ]
  }
}