/**
 * @import { extension } from './types.public.js';
 * @import { NotificationTypeUpsert, OrderData } from '../v-api/types.api.js';
 */

/**
 * @implements {extension}
 */
export class NotificationsExtension {

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
      'checkout/create',
      async (event) => {
        await event.app.api.notifications.addBulk([
            checkout_notification(event.payload, 'Checkout Create')
        ]);
      }
    );

    app.pubsub.on(
      'checkout/complete',
      async (event) => {
        await event.app.api.notifications.addBulk([
          checkout_notification(event.payload, 'Checkout Complete')
        ]);
      }
    );

    // user events notifications

    app.pubsub.on(
      'auth/signup',
      async (event) => {
        const p = event.payload;
        await event.app.api.notifications.addBulk(
          [
            {
              message: `
🔑 **New Signup**\n 
* \`🙋🏻‍♂️ ${p.email ?? 'unknown'}\` has signed up. 
`,
              author: 'backend-bot 🤖',
              actions: [
                {
                  name: 'view',
                  type: 'route',
                  params: {
                    collection: 'customers',
                    document: p.email
                  }
                }
              ]
            }
          ]
        )
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