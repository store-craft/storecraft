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
export class NodePlatform {

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
      duplex: 'half',
      body: from.method==='HEAD' || from.method==='GET' ? undefined : Readable.toWeb(from),
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
    try {
      const headers = Object.fromEntries(
        web_response?.headers?.entries() ?? []
      );
      context.writeHead(
        web_response.status, web_response.statusText, headers
      );

      if(web_response.body) {
        // this is buggy and not finishing, stalls infinitely
        // await finished(Readable.fromWeb(web_response.body).pipe(context))

        // I found this to be better
        const reader = web_response.body.getReader();
        const read_more = async () => {
          const { done, value } = await reader.read();
          if (!done) {
            context.write(value);
            await read_more();
          }
        }

        await read_more(); 
      } 
    } catch (e) {
      console.log(e);
    } finally {
      context.end();
      return context;
    }
  }  
} 