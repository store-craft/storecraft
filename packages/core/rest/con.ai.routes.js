/** @import { ApiPolka } from './types.public.js' */
import { Polka } from '../polka/index.js'
import { assert } from '../api/utils.func.js'
import { App } from '../index.js';

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  polka.post(
    'agent/run',
    async (req, res) => {

      const r = await app.ai.run(
        req.parsedBody
      );

      res.sendJson(r);
    }
  );

  polka.post(
    'agent/stream',
    async (req, res) => {

      const r = await app.ai.runStream(
        req.parsedBody
      );

      res.sendServerSentEvents(
        readable_stream_to_sse(
          r.stream,
          JSON.stringify
        )
      );
    }
  );

  return polka;
}


/**
 * @description Transform a readable stream into **SSE**
 * @template {any} [T=any]
 * @param {ReadableStream<T>} stream 
 * @param {(payload: T) => string} transform 
 */
const readable_stream_to_sse = (stream, transform=(x) => String(x)) => {

  /** @type {ReadableStream<string>} */
  const sse_stream = new ReadableStream(
    {
      start: async (controller) => {
        for await (const chunk of stream) {
          controller.enqueue(
            'data: ' + transform(chunk) + '\r\n'
          )
        }

        controller.close();
      }
    }
  );

  return sse_stream;
}
