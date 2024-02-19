
/**
 * 
 * @param {import("../core/types.mailer.js").MailObject["attachments"][0]["content"]} c 
 */
export const convert_attachment_to_blob = async c => {
  if(c instanceof ArrayBuffer)
    return new Blob([new Uint8Array(c)]);
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
        return new Blob([new Uint8Array(buffer)]);
      }
      buffer.push(value);
    }
  }
  else return new Blob([c.toString()]);  
}

/**
 * 
 * @param {import('@storecraft/core/v-mailer').MailAddress} a 
 */
export const address_to_friendly_name = a => {
  return a.name ? `${a.name} <${a.address}>` : a.address;
}