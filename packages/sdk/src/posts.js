import { StorecraftAdminSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * Base `posts` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').PostTypeUpsert, 
 *  import('@storecraft/core/v-api').PostType>
 * }
 */
export default class Posts extends collection_base {

  /**
   * 
   * @param {StorecraftAdminSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'posts');
  }

}