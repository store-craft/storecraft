import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `posts` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').PostTypeUpsert, 
 *  import('@storecraft/core/api').PostType>
 * }
 */
export default class Posts extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'posts');
  }

}