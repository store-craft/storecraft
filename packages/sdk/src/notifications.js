import { StorecraftSDK } from '../index.js'
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
   * @param {StorecraftSDK} sdk 
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
      this.sdk, 
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

}