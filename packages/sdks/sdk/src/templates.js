/**
 * @import { TemplateTypeUpsert, TemplateType } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { collection_base } from './utils.api.fetch.js';

/**
 * @description Base `templates` **CRUD**
 * 
 * @extends {collection_base<TemplateTypeUpsert, TemplateType>}
 */
export default class Templates extends collection_base {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    super(sdk, 'templates');
  }
}