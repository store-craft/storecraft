/**
 * @import { type VPolkaResponseCreator } from './public.js'
 */
import { STATUS_CODES } from './codes.js';

/**
 * Implements the response creator interface 
 * for Polka {@link VPolkaResponseCreator}
 * @implements {VPolkaResponseCreator}
 */
export class PolkaResponseCreator {
  headers = new Headers();
  finished=false;
  status=200;
  statusText='OK';

  /** @type {VPolkaResponseCreator["body"]} */
  body= undefined;

  /** @type {VPolkaResponseCreator["send"]} */
  send(body) {
    this.body = body;
    this.finished = true;
    return this;
  }
  
  /** @type {VPolkaResponseCreator["end"]} */
  end() {
    return this.send(undefined);
  }
  
  /** @type {VPolkaResponseCreator["sendReadableStream"]} */
  sendReadableStream(o) {
    return this.send(o);
  }
  
  /** @type {VPolkaResponseCreator["sendServerSentEvents"]} */
  sendServerSentEvents(o) {
    this.headers.append('Content-Type', 'text/event-stream');
    return this.send(o);
  }
  
  /** @type {VPolkaResponseCreator["sendJson"]} */
  sendJson(o) {
    this.headers.set('Content-Type', 'application/json');
    return this.send(o===undefined ? undefined : JSON.stringify(o))
  }
  
  /** @type {VPolkaResponseCreator["sendHtml"]} */
  sendHtml(o) {
    this.headers.set('Content-Type', 'text/html');
    return this.send(String(o));
  }
  
  /** @type {VPolkaResponseCreator["sendText"]} */
  sendText(o) {
    this.headers.set('Content-Type', 'text/plain');
    return this.send(String(o))
  }
  
  /** @type {VPolkaResponseCreator["sendBlob"]} */
  sendBlob(o) {
    !o.type && this.headers.set('Content-Type', 'application/octet-stream');
    return this.send(o)
  }
  
  /** @type {VPolkaResponseCreator["sendArrayBuffer"]} */
  sendArrayBuffer(o) {
    this.headers.set('Content-Type', 'application/octet-stream')
    return this.send(o)
  }
  
  /** @type {VPolkaResponseCreator["sendSearchParams"]} */
  sendSearchParams(o) {
    this.headers.set('Content-Type', 'application/x-www-form-urlencoded')
    return this.send(o)
  }
  
  /** @type {VPolkaResponseCreator["sendFormData"]} */
  sendFormData(o) {
    this.headers.set('Content-Type', 'multipart/form-data')
    return this.send(o)
  }
  
  /** @type {VPolkaResponseCreator["setStatus"]} */
  setStatus(code=200, text) {
    if(typeof code === 'string')
      code = 400;
    this.status = code;
    this.statusText = text ?? STATUS_CODES[code.toString()];
    return this;
  }
}