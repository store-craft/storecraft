/**
 * @import { HandleOrId } from '@storecraft/core/database'
 * @import { StorefrontType, StorefrontTypeUpsert } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base, fetchApiWithAuth } from './utils.api.fetch.js';

/**
 * @description Base `storefronts` **CRUD**
 * 
 * @extends {collection_base<StorefrontTypeUpsert, StorefrontType>}
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
   * @param {HandleOrId} handle_or_id
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

  /**
   * @description You can fetch the default auto-generated storefront. 
   * This will fetch all active
   * - collections
   * - discounts 
   * - shipping methods 
   * - posts (latest 5) 
   * - products(latest 10) 
   * that are linked to the storefront. Also, all the products 
   * tags aggregated so you can build a filter system in the frontend
   * @returns {Promise<StorefrontType>}
   */
  get_default_auto_generated_storefront = async () => {
    const result = await fetchApiWithAuth(
      this.sdk,
      `storefronts/auto-generated`,
      {
        method: 'get'
      }
    );

    return result
  }

}