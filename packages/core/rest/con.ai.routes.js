/** @import { ApiPolka } from './types.public.js' */
import { Polka } from '../polka/index.js'
import { assert } from '../api/utils.func.js'
import { App } from '../index.js';

export const HEADER_STORECRAFT_THREAD_ID = 'X-STORECRAFT-THREAD-ID';

/**
 * @param {App} app
 */
export const create_routes = (app) => {

  /** @type {ApiPolka} */
  const polka = new Polka();

  polka.post(
    '/agents/:handle/run',
    async (req, res) => {

      const handle = req?.params?.handle;

      assert(
        app.agents?.[handle],
        `Agent ${handle} not found !`
      );

      const r = await app.agents?.[handle].run(
        req.parsedBody
      );

      res.headers.append(
        HEADER_STORECRAFT_THREAD_ID, 
        r.thread_id
      );
      res.sendJson(r);
    }
  );

  polka.post(
    '/agents/:handle/stream',
    async (req, res) => {

      const handle = req?.params?.handle;

      assert(
        app.agents?.[handle],
        `Agent ${handle} not found !`
      );

      const r = await app.agents?.[handle].runStream(
        req.parsedBody
      );

      res.headers.append(
        HEADER_STORECRAFT_THREAD_ID, 
        r.thread_id
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
            'data: ' + transform(chunk) + '\r\n\r\n'
          )
        }

        controller.close();
      }
    }
  );

  return sse_stream;
}
