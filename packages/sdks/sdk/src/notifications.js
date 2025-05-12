/**
 * @import { 
 *  NotificationTypeUpsert, NotificationType 
 * } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { 
  collection_base, fetchApiWithAuth 
} from './utils.api.fetch.js';

/**
 * @description Base `notifications` **CRUD**
 * @extends {collection_base<NotificationTypeUpsert, NotificationType>}
 */
export default class Notifications extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'notifications');
  }

  /**
   * @param {NotificationTypeUpsert[]} items 
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