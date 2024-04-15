import { StorecraftAdminSDK } from '../index.js'
import { 
  collection_base, fetchApiWithAuth 
} from './utils.api.fetch.js';

/**
 * Base `notifications` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').NotificationTypeUpsert, 
 *  import('@storecraft/core/v-api').NotificationType>
 * }
 */
export default class Notifications extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'notifications');
  }

  /**
   * 
   * @param {import('@storecraft/core/v-api').NotificationTypeUpsert[]} items 
   */
  upsertBulk = items => {
    return fetchApiWithAuth(
      `${this.base_name}`,
      {
        method: 'post',
        body: JSON.stringify(items),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  meta = () => {
    return this.get('_meta')
  }

  /**
   * Test if backend moght have new data economically
   * @returns {Promise<boolean>}
   */
  hasChanged = async () => {
    try {
      // try cache
      const cached = await this.list([], 50, true, false)
      if (cached.length==0)
        return true

      // compute how many latest updates with max timestamp in cache  
      const max_updated = cached.reduce(
        (p, c) => {
          const updatedAt = c[1]?.updatedAt

          if(updatedAt==p.timestamp)
            p.count+=1
          else if(updatedAt>p.timestamp)
            p.count=1

          p.timestamp = Math.max(updatedAt ?? -1, p.timestamp)
          return p
        },
        {
          timestamp: 0,
          count: 0
        }
      )

      // now, use a light count query to the database
      const count = await this.context.db.col(NAME).count(
        {
          where: [
            ['updatedAt', '>=', max_updated.timestamp]
          ]
        }
      )

      // console.log(cached)
      // console.log('count ', count)
      // console.log('max_updated ', max_updated)

      if(count > max_updated.count)
        return true
      
      return false
      
    } catch (e) {
      // error
      console.error(e)
      return true
    }
    
  }

}