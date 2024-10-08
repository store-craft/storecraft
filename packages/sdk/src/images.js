import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `images` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').ImageTypeUpsert, 
 *  import('@storecraft/core/api').ImageType>
 * }
 */
export default class Images extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'images');
  }
}