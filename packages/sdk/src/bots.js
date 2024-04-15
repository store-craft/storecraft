import { StorecraftAdminSDK } from '../index.js'

export const SECOND = 1000
export const MINUTE = SECOND*60


/**
 * @typedef {object} BotMetaData
 * @property {number} updatedAt
 * 
 */

const NAME = 'bots'

export default class Bots {

  /**
   * @param {StorecraftAdminSDK} context 
   */
  constructor(context) {
    this.context = context
    this.db = context.db
  }

  init = async () => {
    // this.activitySpy()
    this.activityBot()
    setInterval(
      this.activityBot,
      MINUTE*10
    )
  }

  activityBot = async () => {
    // console.trace()
    try {
      const db = this.db.firebaseDB
      const result = await runTransaction(
        this.db.firebaseDB,
        async t => {
          const now = Date.now()
          const ref = doc(db, NAME, 'shelf-activity-bot')
          const m = await t.get(ref)
          const updatedAt = m.data()?.updatedAt ?? 0
  
          const q = {
            where: [
              ['updatedAt', '>', updatedAt]
            ]
          }
  
          const cols = ['collections', 'products', 'users', 'tags', 'discounts']
          const results = cols.map(
            async c => [c, await this.db.col(c).count(q)]
          )
          
          t.set(
            m.ref,
            {
              updatedAt: now
            }
          )
  
          return await Promise.all(results)
    
        }, 
        {
          maxAttempts: 1
        }
      )

      let filtered = result.filter(
        it => it[1]
      )

      if(filtered.length==0)
        return

      const search = filtered.map(it => it[0])
      const messages = filtered.map(
        it => {
          const [c, count] = it
          return `\n* 🚀 **${count}** \`${c}\` were updated`
        }
      );

      const message = ["**Latest Activity updates**", ...messages].join(' ')
      /**@type {NotificationData} */
      const noti = {
        message,
        search,
        author: 'shelf-activity-bot 🤖',
        updatedAt: Date.now()
      }

      // console.log(messages)
      // console.log(message)

      await this.context.notifications.add(
        noti
      )

    } catch (e) {
      // failed because another the document updated from another client
      // this is ok
      console.log(e)
    }
    


  }
  
}