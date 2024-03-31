import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `settings` **CRUD**
 * 
 * @extends {collection_base<any, any>}
 */
export default class Settings extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'settings');
  }

}