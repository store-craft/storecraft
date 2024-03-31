import { StorecraftAdminSDK } from './index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `images` **CRUD**
 * 
 * @extends {collection_base<import('@storecraft/core/v-api').ImageTypeUpsert, 
 * import('@storecraft/core/v-api').ImageType>}
 */
export default class Images extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'images');
  }
}