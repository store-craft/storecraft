import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `templates` **CRUD**
 * 
 * @extends {collection_base<
 *  import('@storecraft/core/api').TemplateTypeUpsert, 
 *  import('@storecraft/core/api').TemplateType>
 * }
 */
export default class Templates extends collection_base {

  /**
   * 
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'templates');
  }
}