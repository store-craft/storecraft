/**
 * @import { error } from '@storecraft/core/api'
 */

/**
 * @description Easily `format` errors coming from 
 * the `storecraft` backend
 * @param {error} error
 */
export const format_storecraft_errors = (
  error
) => {
  return error?.messages?.map(
    it => {
      let msg = '';
      if(it.path) {
        msg += it.path.join('.') + ' - '
      }
      msg += it.message ?? 'Unknown Error';
      return msg;
    }
  ) ?? ['ouch, unexpected error'];
}