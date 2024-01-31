import 'dotenv/config'
import { Readable } from 'node:stream'

/**
 * 
 * @typedef {import('node:http').IncomingMessage} IncomingMessage
 * @typedef {import('node:http').ServerResponse} ServerResponse
 * @typedef {import("@storecraft/core").PlatformAdapter<IncomingMessage, ServerResponse>} RequestEncoderType
 */


/**
 * @typedef {import('@storecraft/core').PlatformAdapter<IncomingMessage, ServerResponse, ServerResponse>} PlatformAdapter
 * @implements {PlatformAdapter}
 */
export class NodeAdapter {

  constructor() {
  }

  get env() {
    return process.env;
  }

  /**
   * @param {IncomingMessage} from
   */
  async encode(from) {

    /** @type {RequestInit} */
    const init = {
      method: from.method,
      // @ts-ignore
      headers: from.headers,
      body: from.method==='HEAD' || from.method==='GET' ? undefined : Readable.toWeb(from),
      duplex: 'half'
    }

    /** @type {Request} */
    const web_req = new Request(
      `https://host${from.url}`,
      init
    )
  
    return web_req
  }

  /**
   * 
   * @param {Response} web_response 
   * @param {ServerResponse} context 
   */
  async handleResponse(web_response, context) {
    const headers = Object.fromEntries(web_response?.headers?.entries() ?? []);
    context.writeHead(web_response.status, web_response.statusText, headers);
    if(web_response.body)
      Readable.fromWeb(web_response.body).pipe(context);
    else context.end();
    return context;
  } 
 
} 