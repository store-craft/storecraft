/**
 * @import { StorecraftConfig } from '@storecraft/core'
 * @import { StorecraftAppPublicInfo } from '@storecraft/core/api'
 */
import { StorecraftSDK } from '../index.js'
import { fetchApiWithAuth } from './utils.api.fetch.js';

/**
 * @description Reference
 */
export default class Reference {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @returns {Promise<StorecraftConfig>}
   */
  settings = async () => {
    /** @type {StorecraftConfig} */
    const json = await fetchApiWithAuth(
      this.sdk,
      'settings',
      { method: 'get' },
    );
    return json;
  }

  /**
   * @returns {Promise<StorecraftAppPublicInfo>}
   */
  info = async () => {
    /** @type {StorecraftAppPublicInfo} */
    const json = await fetchApiWithAuth(
      this.sdk,
      'info',
      { method: 'get' },
    );
    return json;
  }

}