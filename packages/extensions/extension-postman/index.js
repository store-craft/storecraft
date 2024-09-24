/**
 * @import { extension } from '@storecraft/core/v-extensions';
 * @import { AuthUserType, OrderData } from '@storecraft/core/v-api';
 */

import { enums } from '@storecraft/core/v-api';

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
      'orders/checkout/complete',
      async (event) => {
        const t = await event.app.api.templates.get('checkout-complete');
        
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