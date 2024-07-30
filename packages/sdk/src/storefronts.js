import { StorecraftSDK } from '../index.js'
import { collection_base, fetchApiWithAuth } from './utils.api.fetch.js';

/**
 * Base `storefronts` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/v-api').StorefrontTypeUpsert, 
 *  import('@storecraft/core/v-api').StorefrontType>
 * }
 */
export default class Storefronts extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'storefronts');
  }

  /**
   * @description Export a storefront into the `storage`. This is
   * beneficial for `collections`, that hardly change and therefore can be 
   * efficiently stored in a cost-effective `storage` and **CDN** network.
   * 
   * @param {import('@storecraft/core/v-database').HandleOrId} handle_or_id
   */
  publish = async (handle_or_id) => {

    const result = await fetchApiWithAuth(
      this.sdk,
      `storefronts/${handle_or_id}/export`,
      {
        method: 'post'
      }
    );

    return result
  }

}