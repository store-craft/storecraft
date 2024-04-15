import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `tags` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').TagTypeUpsert, 
 *  import('@storecraft/core/v-api').TagType>
 * }
 */
export default class Tags extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'tags');
  }
}