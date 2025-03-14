/**
 * @import { mailer, MailObject } from '@storecraft/core/mailer'
*/
import { Readable } from 'node:stream'

/**
 * convert:
 * - arraybuffer -> Buffer
 * - readablestream -> readable
 * @param {MailObject["attachments"][0]["content"]} c 
 */
export const attachment_convert = c => {
  if(c instanceof ArrayBuffer)
    return Buffer.from(c);
  else if(c instanceof ReadableStream)
    return Readable.fromWeb(c);
  else return c;
} 