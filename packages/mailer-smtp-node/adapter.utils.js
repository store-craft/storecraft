import { Readable } from 'node:stream'

/**
 * convert:
 * - arraybuffer -> Buffer
 * - readablestream -> readable
 * @param {import("../core/types.mailer.js").MailObject["attachments"][0]["content"]} c 
 */
export const attachment_convert = c => {
  if(c instanceof ArrayBuffer)
    return Buffer.from(c);
  else if(c instanceof ReadableStream)
    return Readable.fromWeb(c);
  else return c;
} 