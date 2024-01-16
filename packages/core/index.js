import { STATUS_CODES } from './v-polka/codes.js';
import { Polka } from './v-polka/index.js'
import { create_api } from './v-api/index.js'

/**
 * @template PlatformNativeRequest
 * @template PlatformContext
 */
export class App {

  /**
   * 
   * @param {import('./public').PlatformAdapter<PlatformNativeRequest, PlatformContext>} platform platform
   */
  constructor(platform) {

    // this._polka = new Polka();
    // this._polka = polka_api
    this._platform = platform;
    this._polka = create_api(this);
  }

  /**
   * Get the Polka router
   */
  get polka() {
    return this._polka
  }

  /**
   * Get the native platform object
   */
  get platform() {
    return this._platform
  }

  hello = () => {}

  /**
   * Process a request with context in the native platform
   * 
   * @param {PlatformNativeRequest} req 
   * @param {PlatformContext} context 
   */
  handler = async (req, context) => {
    const request = await this._platform.encode(req)

    /** @type {import('./public').VPolkaResponse} */
    const polka_response = {
      headers: new Headers(),
      finished: false,
      status: 200,
      statusText: 'OK',
      body: undefined,

      send(body) {
        this.body = body;
        this.finished = true;
        return this;
      },

      sendJson(o) {
        this.headers.set('Content-Type', 'application/json')
        return this.send(JSON.stringify(o))
      },

      sendText(o) {
        this.headers.set('Content-Type', 'text/plain')
        return this.send(o)
      },

      setStatus(code=200, text) {
        this.status = code;
        this.statusText = text ?? STATUS_CODES[code.toString()];
        return this
      }

    }

    await this._polka.handler(request, polka_response);

    console.log('polka_response.body ', polka_response.body);

    const response_web = new Response(
      polka_response.body, {
        headers: polka_response.headers,
        status: polka_response.status, 
        statusText: polka_response.statusText
      }
    )

    await this._platform.handleResponse(response_web, context);
  }

}


