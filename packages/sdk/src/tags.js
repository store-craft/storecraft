import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `tags` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').TagTypeUpsert, 
 *  import('@storecraft/core/api').TagType>
 * }
 */
export default class Tags extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'tags');
  }
}