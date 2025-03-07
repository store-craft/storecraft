import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `settings` **CRUD**
 * 
 * @extends {collection_base<any, any>}
 */
export default class Settings extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'settings');
  }

}