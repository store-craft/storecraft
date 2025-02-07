/**
 * @import { extension } from '../types.public.js';
 * @import { NotificationTypeUpsert, OrderData } from '../../api/types.api.js';
 */

/**
 * @implements {extension<unknown>}
 */
export class NotificationsExtension {

  get config() {
    return undefined;
  }

  get actions() {
    return [];
  }

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
      'orders/checkout/created',
      async (event) => {
        await event.app.api.notifications.addBulk([
          checkout_notification(event.payload.current, 'Checkout Create')
        ]);
      }
    );

    app.pubsub.on(
      'orders/checkout/complete',
      async (event) => {
        await event.app.api.notifications.addBulk([
          checkout_notification(event.payload.current, 'Checkout Complete')
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
* \`🙋🏻‍♂️ ${p.firstname ?? p.email ?? 'unknown'}\` has signed up. 
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
* \`${o?.contact?.firstname ?? o?.address?.firstname ?? 'unknown'}\` has checkout update. 
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