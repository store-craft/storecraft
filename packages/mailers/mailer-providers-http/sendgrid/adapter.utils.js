/**
 * @import { mailer, MailObject } from '@storecraft/core/mailer'
*/
import { base64 } from '@storecraft/core/crypto'

/**
 * 
 * @param {MailObject["attachments"][number]["content"]} c 
 */
export const convert_to_base64 = async (c) => {
  if(c instanceof ArrayBuffer)
    return base64.fromUint8Array(new Uint8Array(c));
  else if(c instanceof ReadableStream) {
    const reader = c.getReader();
    const buffer = []
    while (true) {
      // The `read()` method returns a promise that
      // resolves when a value has been received.
      const { done, value } = await reader.read();
      // Result objects contain two properties:
      // `done`  - `true` if the stream has already given you all its data.
      // `value` - Some data. Always `undefined` when `done` is `true`.
      if (done) {
        return base64.fromUint8Array(new Uint8Array(buffer));
      }
      buffer.push(value);
    }
  }
  else return base64.toBase64(c.toString());
}