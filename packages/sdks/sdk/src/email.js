/**
 * @import { 
 *  MailResponse, SendMailParams, SendMailWithTemplateParams, templates_keys, 
 *  templates_input_types
 * } from '@storecraft/core/api'
 */

import { StorecraftSDK } from '../index.js'
import { fetchApiWithAuth, url } from './utils.api.fetch.js';

/**
 */
export default class Email {

  /**
   * @param {StorecraftSDK} sdk 
   */
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @description Send an email to multiple recipients
   * @param {SendMailParams} params mail parameters
   * @returns {Promise<MailResponse<any>>}
   */
  send = async (params) => {
    const json = await fetchApiWithAuth(
      this.sdk,
      'emails/send',
      { 
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return json;
  }

  /**
   * @description Send an email to multiple recipients with a template. 
   * Each template has a `subject`, `html` and `text` body templates, 
   * that you can configure at the dashboard
   * @template {templates_keys | string} [HANDLE=keyof templates_input_types]
   * @param {SendMailWithTemplateParams<HANDLE>} params mail parameters
   * @returns {Promise<MailResponse<any>>}
   */
  sendWithTemplate = async (params) => {
    const json = await fetchApiWithAuth(
      this.sdk,
      'emails/send-with-template',
      { 
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return json;
  }

}


